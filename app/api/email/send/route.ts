import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/service';

export async function POST(request: NextRequest) {
  try {
    const { projectId, template, recipient, variables, options } = await request.json();
    
    // التحقق من الصلاحيات
    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // التحقق من صلاحية المشروع
    const { data: projectUser } = await supabase
      .from('project_users')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();
    
    if (!projectUser || !['admin', 'editor'].includes(projectUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // إرسال البريد
    const emailService = new EmailService(projectId);
    const result = await emailService.sendTemplate(
      template,
      recipient,
      variables,
      options
    );
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
    
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
