import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    );
  }
  
  const supabase = createSupabaseAdminClient()
  
  // جلب القوالب حسب النوع
  const { data: templates, error } = await supabase
    .from('communication_templates')
    .select('*')
    .eq('project_id', projectId)
    .eq('channel', type)
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ templates });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const body = await request.json();
    const { projectId, ...templateData } = body;
    
    const supabase = createSupabaseAdminClient()
    
    // إنشاء قالب جديد
    const { data: template, error } = await supabase
      .from('communication_templates')
      .insert({
        project_id: projectId,
        channel: type,
        ...templateData,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      template,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
