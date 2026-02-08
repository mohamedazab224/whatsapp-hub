import nodemailer from "nodemailer"
import Handlebars from "handlebars"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { render } from "@/lib/template-engine"

export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(private projectId: string) {
    this.initializeTransporter();
  }
  
  private async initializeTransporter() {
    // الحصول على إعدادات SMTP من Project Config
    const supabase = createSupabaseAdminClient()
    const { data: project } = await supabase
      .from('projects')
      .select('smtp_config')
      .eq('id', this.projectId)
      .single();
    
    this.transporter = nodemailer.createTransport({
      host: project?.smtp_config?.host || process.env.DEFAULT_SMTP_HOST,
      port: project?.smtp_config?.port || 587,
      secure: true,
      auth: {
        user: project?.smtp_config?.username || process.env.DEFAULT_SMTP_USER,
        pass: project?.smtp_config?.password || process.env.DEFAULT_SMTP_PASS,
      },
    });
  }
  
  async sendTemplate(
    templateName: string,
    recipient: { email: string; name?: string },
    variables: Record<string, any>,
    options?: {
      attachments?: Array<{ filename: string; path: string }>;
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
    }
  ) {
    // 1. جلب القالب من قاعدة البيانات
    const template = await this.getTemplate(templateName);
    
    // 2. تجميع المحتوى مع المتغيرات
    const { subject, html, text } = await this.compileTemplate(template, variables);
    
    // 3. إعداد خيارات البريد
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.getFromAddress(template),
      to: `${recipient.name} <${recipient.email}>`,
      subject,
      html,
      text,
      ...options,
    };
    
    // 4. إرسال البريد
    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // 5. تسجيل في سجل البريد
      await this.logEmail({
        templateId: template.id,
        recipient,
        subject,
        variables,
        status: 'sent',
        messageId: info.messageId,
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      // تسجيل الخطأ
      await this.logEmail({
        templateId: template.id,
        recipient,
        subject,
        variables,
        status: 'failed',
        error: error.message,
      });
      
      throw error;
    }
  }
  
  private async getTemplate(templateName: string) {
    const supabase = createSupabaseAdminClient()
    const { data: template } = await supabase
      .from('communication_templates')
      .select('*')
      .eq('project_id', this.projectId)
      .eq('name', templateName)
      .eq('channel', 'email')
      .eq('status', 'active')
      .single();
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }
    
    return template;
  }
  
  private async compileTemplate(template: any, variables: Record<string, any>) {
    // التحقق من المتغيرات المطلوبة
    this.validateVariables(template.required_variables, variables);
    
    // تجميع باستخدام Handlebars
    const compiledSubject = Handlebars.compile(template.subject)(variables);
    const compiledHtml = render(template.html_content, variables);
    const compiledText = template.text_content 
      ? Handlebars.compile(template.text_content)(variables)
      : null;
    
    return {
      subject: compiledSubject,
      html: compiledHtml,
      text: compiledText,
    };
  }

  private validateVariables(required: string[] | null | undefined, variables: Record<string, any>) {
    if (!required || required.length === 0) return
    const missing = required.filter((key) => variables[key] === undefined || variables[key] === null)
    if (missing.length > 0) {
      throw new Error(`Missing required variables: ${missing.join(", ")}`)
    }
  }
  
  private getFromAddress(template: any) {
    const projectConfig = template.project.email_config;
    return `"${projectConfig?.sender_name || 'Al-Azab'}" <${projectConfig?.sender_email || 'noreply@al-azab.co'}>`;
  }
  
  private async logEmail(data: any) {
    const supabase = createSupabaseAdminClient()
    await supabase
      .from('email_logs')
      .insert({
        project_id: this.projectId,
        template_id: data.templateId,
        sender_email: this.getFromAddress(data.template),
        recipient_email: data.recipient.email,
        recipient_name: data.recipient.name,
        subject: data.subject,
        html_content: data.html,
        text_content: data.text,
        variables_used: data.variables,
        status: data.status,
        message_id: data.messageId,
        smtp_response: data.error || 'Sent successfully',
        sent_at: new Date().toISOString(),
      });
  }
}
