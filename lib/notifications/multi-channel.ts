import { EmailService } from '@/lib/email/service';
import { WhatsAppService } from '@/lib/whatsapp/service';
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export class MultiChannelNotificationService {
  constructor(private projectId: string) {}
  
  async send(
    channels: Array<'email' | 'whatsapp' | 'sms'>,
    templateName: string,
    recipient: {
      email?: string;
      phone?: string;
      name?: string;
    },
    variables: Record<string, any>,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      scheduleAt?: Date;
    }
  ) {
    const results = [];
    
    // إرسال عبر كل قناة
    for (const channel of channels) {
      try {
        let result;
        
        switch (channel) {
          case 'email':
            if (recipient.email) {
              const emailService = new EmailService(this.projectId);
              result = await emailService.sendTemplate(
                templateName,
                { email: recipient.email, name: recipient.name },
                variables
              );
            }
            break;
            
          case 'whatsapp':
            if (recipient.phone) {
              const whatsappService = WhatsAppService.getInstance();
              result = await whatsappService.sendTemplateMessage({
                phone: recipient.phone,
                templateName,
                variables,
                projectId: this.projectId,
              });
            }
            break;
        }
        
        if (result) {
          results.push({
            channel,
            success: true,
            result,
          });
          
          // تحديث سجل التواصل الموحد
          await this.logCommunication(channel, templateName, recipient, 'sent');
        }
      } catch (error) {
        results.push({
          channel,
          success: false,
          error: error.message,
        });
        
        await this.logCommunication(channel, templateName, recipient, 'failed', error.message);
      }
    }
    
    return {
      success: results.some(r => r.success),
      results,
    };
  }
  
  private async logCommunication(
    channel: string,
    templateName: string,
    recipient: any,
    status: string,
    error?: string
  ) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from('communication_logs')
      .insert({
        project_id: this.projectId,
        channel,
        template_name: templateName,
        recipient_info: recipient,
        status,
        error_message: error,
        created_at: new Date().toISOString(),
      });
  }
}
