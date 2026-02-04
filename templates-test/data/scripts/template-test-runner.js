const fs = require('fs');
const path = require('path');

class TemplateTester {
  constructor() {
    this.templates = this.loadTemplates();
    this.testCases = this.loadTestCases();
  }

  loadTemplates() {
    const data = fs.readFileSync(
      path.join(__dirname, '../data/templates-metadata.json'),
      'utf8'
    );
    return JSON.parse(data).templates;
  }

  loadTestCases() {
    const data = fs.readFileSync(
      path.join(__dirname, '../data/test-cases.json'),
      'utf8'
    );
    return JSON.parse(data).test_cases;
  }

  renderTemplate(templateContent, parameters) {
    let rendered = templateContent;
    
    // استبدال المتغيرات {{1}}، {{2}}، إلخ
    Object.keys(parameters).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = parameters[key];
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return rendered;
  }

  runTests() {
    const results = [];
    
    this.testCases.forEach(templateTest => {
      const template = this.templates.find(t => t.id === templateTest.template_id);
      
      if (template) {
        templateTest.test_cases.forEach(testCase => {
          const actualOutput = this.renderTemplate(template.content, testCase.parameters);
          const passed = actualOutput === testCase.expected_output;
          
          results.push({
            template_id: templateTest.template_id,
            template_name: template.name,
            case_id: testCase.case_id,
            parameters: testCase.parameters,
            expected: testCase.expected_output,
            actual: actualOutput,
            passed: passed,
            timestamp: new Date().toISOString()
          });
          
          console.log(`Test ${testCase.case_id}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
          if (!passed) {
            console.log(`  Expected: ${testCase.expected_output}`);
            console.log(`  Actual: ${actualOutput}`);
          }
        });
      }
    });
    
    this.generateReport(results);
    return results;
  }

  generateReport(results) {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    const report = `
# تقرير اختبار القوالب
**تاريخ الاختبار:** ${new Date().toLocaleDateString('ar-SA')}
**الوقت:** ${new Date().toLocaleTimeString('ar-SA')}

## النتائج الإجمالية
✅ **النجاح:** ${passedCount} من ${totalCount}
❌ **الفشل:** ${totalCount - passedCount} من ${totalCount}
📊 **نسبة النجاح:** ${((passedCount / totalCount) * 100).toFixed(2)}%

## تفاصيل الاختبارات
${results.map(r => `
### ${r.template_id} - ${r.template_name}
**حالة الاختبار:** ${r.passed ? '✅ نجح' : '❌ فشل'}
**معرف الحالة:** ${r.case_id}
**المعلمات:** ${JSON.stringify(r.parameters, null, 2)}
**المخرجات المتوقعة:** ${r.expected}
**المخرجات الفعلية:** ${r.actual}
`).join('\n')}

## ملخص القوالب
${this.templates.map(t => `
- **${t.id}**: ${t.name} (${t.category}) - ${t.language}
  - الحالة: ${t.status}
  - آخر تعديل: ${t.last_modified}
`).join('\n')}
    `;
    
    const reportPath = path.join(__dirname, '../reports/test-results.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n✅ تم إنشاء التقرير في: ${reportPath}`);
  }

  validateAllTemplates() {
    console.log('## التحقق من جميع القوالب');
    console.log('='.repeat(50));
    
    this.templates.forEach(template => {
      console.log(`\n📋 ${template.id} - ${template.name}`);
      console.log(`   الفئة: ${template.category}`);
      console.log(`   اللغة: ${template.language}`);
      console.log(`   الحالة: ${template.status}`);
      console.log(`   المحتوى: ${template.content.substring(0, 100)}...`);
      
      // الكشف عن المتغيرات في القالب
      const variables = template.content.match(/\{\{\d+\}\}/g);
      if (variables) {
        console.log(`   المتغيرات المطلوبة: ${[...new Set(variables)].join(', ')}`);
      } else {
        console.log(`   المتغيرات المطلوبة: لا يوجد`);
      }
    });
  }
}

// تشغيل الاختبارات
const tester = new TemplateTester();

console.log('🚀 بدء اختبار القوالب');
console.log('='.repeat(50));

tester.validateAllTemplates();
console.log('\n' + '='.repeat(50));
console.log('🧪 تشغيل حالات الاختبار');
console.log('='.repeat(50));

tester.runTests();