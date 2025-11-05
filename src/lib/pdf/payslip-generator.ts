/**
 * Payslip PDF Generation
 * Generates professional payslips for employees
 */

export interface PayslipData {
  payment: {
    id: string;
    payment_date: string;
    period_start: string;
    period_end: string;
    period_name: string;
    regular_hours: number;
    overtime_hours: number;
    hourly_rate: number;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
    calculation_details?: any;
  };
  employee: {
    employee_number: string;
    name: string;
    email: string;
    department: string;
    position: string;
  };
  university: {
    name: string;
    address: string;
    phone?: string;
    email: string;
  };
  deductions: Array<{
    name: string;
    type: string;
    amount: number;
  }>;
  allowances: Array<{
    name: string;
    type: string;
    amount: number;
    is_taxable: boolean;
  }>;
  ytd_summary: {
    ytd_gross: number;
    ytd_deductions: number;
  };
}

/**
 * Generate HTML for payslip (can be converted to PDF using libraries like html2pdf, puppeteer, etc.)
 */
export function generatePayslipHTML(data: PayslipData): string {
  const totalAllowances = data.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;
  const totalDeductions = data.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${data.payment.period_name}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .university-name {
      font-size: 24px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 5px;
    }
    .document-title {
      font-size: 18px;
      color: #475569;
      margin-top: 10px;
    }
    .info-section {
      margin-bottom: 25px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-label {
      font-weight: 600;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-value {
      color: #1e293b;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:hover {
      background: #f8fafc;
    }
    .amount-column {
      text-align: right;
      font-family: monospace;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e3a8a;
      margin: 25px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .summary-box {
      background: #f0f9ff;
      border: 2px solid #2563eb;
      border-radius: 8px;
      padding: 20px;
      margin-top: 25px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-row.total {
      border-top: 2px solid #2563eb;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
    }
    .net-pay {
      background: #10b981;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .net-pay-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .net-pay-amount {
      font-size: 32px;
      font-weight: bold;
      margin-top: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }
    .ytd-box {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 6px;
      padding: 12px;
      margin-top: 15px;
      display: flex;
      justify-content: space-around;
    }
    .ytd-item {
      text-align: center;
    }
    .ytd-label {
      font-size: 10px;
      color: #92400e;
      font-weight: 600;
    }
    .ytd-value {
      font-size: 14px;
      color: #78350f;
      font-weight: bold;
      margin-top: 4px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="university-name">${data.university.name}</div>
    <div style="color: #64748b; font-size: 12px;">${data.university.address}</div>
    ${data.university.phone ? `<div style="color: #64748b; font-size: 12px;">${data.university.phone}</div>` : ''}
    <div class="document-title">PAYSLIP</div>
    <div style="color: #64748b; margin-top: 8px;">${data.payment.period_name}</div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Employee Name</div>
      <div class="info-value">${data.employee.name}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Employee Number</div>
      <div class="info-value">${data.employee.employee_number}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Department</div>
      <div class="info-value">${data.employee.department}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Position</div>
      <div class="info-value">${data.employee.position}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Pay Period</div>
      <div class="info-value">${new Date(data.payment.period_start).toLocaleDateString()} - ${new Date(data.payment.period_end).toLocaleDateString()}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Payment Date</div>
      <div class="info-value">${new Date(data.payment.payment_date).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="section-title">Hours Worked</div>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th style="text-align: right;">Hours</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Regular Hours</td>
        <td class="amount-column">${data.payment.regular_hours.toFixed(2)}</td>
        <td class="amount-column">$${data.payment.hourly_rate.toFixed(2)}</td>
        <td class="amount-column">$${(data.payment.regular_hours * data.payment.hourly_rate).toFixed(2)}</td>
      </tr>
      ${data.payment.overtime_hours > 0 ? `
      <tr>
        <td>Overtime Hours</td>
        <td class="amount-column">${data.payment.overtime_hours.toFixed(2)}</td>
        <td class="amount-column">$${(data.payment.hourly_rate * 1.5).toFixed(2)}</td>
        <td class="amount-column">$${(data.payment.overtime_hours * data.payment.hourly_rate * 1.5).toFixed(2)}</td>
      </tr>
      ` : ''}
    </tbody>
  </table>

  ${data.allowances && data.allowances.length > 0 ? `
  <div class="section-title">Allowances</div>
  <table>
    <thead>
      <tr>
        <th>Allowance</th>
        <th style="text-align: center;">Taxable</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.allowances.map(allowance => `
      <tr>
        <td>${allowance.name}</td>
        <td style="text-align: center;">${allowance.is_taxable ? 'Yes' : 'No'}</td>
        <td class="amount-column">$${allowance.amount.toFixed(2)}</td>
      </tr>
      `).join('')}
      <tr style="font-weight: bold; background: #f0f9ff;">
        <td colspan="2">Total Allowances</td>
        <td class="amount-column">$${totalAllowances.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  ` : ''}

  ${data.deductions && data.deductions.length > 0 ? `
  <div class="section-title">Deductions</div>
  <table>
    <thead>
      <tr>
        <th>Deduction</th>
        <th>Type</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.deductions.map(deduction => `
      <tr>
        <td>${deduction.name}</td>
        <td><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 10px;">${deduction.type.replace(/_/g, ' ')}</span></td>
        <td class="amount-column">$${deduction.amount.toFixed(2)}</td>
      </tr>
      `).join('')}
      <tr style="font-weight: bold; background: #fef2f2;">
        <td colspan="2">Total Deductions</td>
        <td class="amount-column">$${totalDeductions.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  ` : ''}

  <div class="summary-box">
    <div class="summary-row">
      <span>Gross Pay</span>
      <span style="font-weight: 600;">$${data.payment.gross_pay.toFixed(2)}</span>
    </div>
    ${totalAllowances > 0 ? `
    <div class="summary-row">
      <span>Total Allowances (+)</span>
      <span style="font-weight: 600; color: #10b981;">$${totalAllowances.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="summary-row">
      <span>Total Deductions (-)</span>
      <span style="font-weight: 600; color: #ef4444;">$${totalDeductions.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>NET PAY</span>
      <span>$${data.payment.net_pay.toFixed(2)}</span>
    </div>
  </div>

  <div class="ytd-box">
    <div class="ytd-item">
      <div class="ytd-label">YTD GROSS EARNINGS</div>
      <div class="ytd-value">$${data.ytd_summary.ytd_gross.toFixed(2)}</div>
    </div>
    <div class="ytd-item">
      <div class="ytd-label">YTD DEDUCTIONS</div>
      <div class="ytd-value">$${data.ytd_summary.ytd_deductions.toFixed(2)}</div>
    </div>
    <div class="ytd-item">
      <div class="ytd-label">YTD NET PAY</div>
      <div class="ytd-value">$${(data.ytd_summary.ytd_gross - data.ytd_summary.ytd_deductions).toFixed(2)}</div>
    </div>
  </div>

  <div class="footer">
    <p><strong>This is a computer-generated payslip and does not require a signature.</strong></p>
    <p>For any queries regarding your payment, please contact the HR department at ${data.university.email}</p>
    <p style="margin-top: 15px; color: #94a3b8;">Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Client-side function to download payslip as PDF
 * Requires html2pdf.js or similar library
 */
export async function downloadPayslipPDF(payslipData: PayslipData) {
  const html = generatePayslipHTML(payslipData);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  try {
    // Use html2pdf library (needs to be installed: npm install html2pdf.js)
    // @ts-ignore
    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: 10,
        filename: `payslip-${payslipData.employee.employee_number}-${payslipData.payment.period_name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // @ts-ignore
      await html2pdf().set(opt).from(container).save();
    } else {
      // Fallback: open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    }
  } finally {
    document.body.removeChild(container);
  }
}



