import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAIL_JS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateIdApply: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_APPLY,
  templateIdStatus: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_STATUS,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  userId: import.meta.env.VITE_EMAILJS_USER_ID
};

// Initialize EmailJS
emailjs.init(EMAIL_JS_CONFIG.publicKey);

/**
 * Send email notification
 * @param {Object} emailData - Email configuration
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - Email HTML content
 * @param {Object} emailData.templateParams - Additional template parameters
 */
export const sendEmail = async (emailData) => {
  try {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.toName || 'User',
      from_name: emailData.fromName || 'Blood Donation System',
      subject: emailData.subject,
      message: emailData.html || emailData.message,
      user_name: emailData.userName || emailData.toName || 'User',
      user_email: emailData.userEmail || emailData.to,
      user_message: emailData.message || emailData.html,
      reply_to: emailData.replyTo || 'noreply@blooddonation.com',
      ...emailData.templateParams
    };

    // Use appropriate template based on email type
    const templateId = emailData.templateType === 'status' 
      ? EMAIL_JS_CONFIG.templateIdStatus 
      : EMAIL_JS_CONFIG.templateIdApply;

    const response = await emailjs.send(
      EMAIL_JS_CONFIG.serviceId,
      templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

/**
 * Send blood request notification to admin
 */
export const sendBloodRequestNotification = async (requestData) => {
  const subject = `New Blood Request - ${requestData.urgency.toUpperCase()} Priority`;
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">🩸 New Blood Request Received</h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Request Details</h3>
        <p><strong>Request ID:</strong> ${requestData.id}</p>
        <p><strong>Urgency:</strong> <span style="color: ${requestData.urgency === 'emergency' ? '#dc2626' : requestData.urgency === 'urgent' ? '#f59e0b' : '#10b981'};">${requestData.urgency.toUpperCase()}</span></p>
        <p><strong>Patient:</strong> ${requestData.patientName} (Age: ${requestData.patientAge})</p>
        <p><strong>Blood Group:</strong> ${requestData.bloodGroup}</p>
        <p><strong>Units Required:</strong> ${requestData.unitsRequired}</p>
        <p><strong>Required By:</strong> ${new Date(requestData.requiredBy).toLocaleString()}</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Hospital Information</h3>
        <p><strong>Hospital:</strong> ${requestData.hospitalName}</p>
        <p><strong>Address:</strong> ${requestData.hospitalAddress}</p>
        <p><strong>Contact Person:</strong> ${requestData.contactPerson}</p>
        <p><strong>Phone:</strong> ${requestData.contactPhone}</p>
        <p><strong>Email:</strong> ${requestData.contactEmail}</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Medical Information</h3>
        <p><strong>Reason:</strong> ${requestData.medicalReason}</p>
        ${requestData.additionalNotes ? `<p><strong>Additional Notes:</strong> ${requestData.additionalNotes}</p>` : ''}
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #dc2626;"><strong>⚠️ Please review and process this request promptly.</strong></p>
      </div>
    </div>
  `;

  return sendEmail({
    to: 'admin@bloodbank.com', // Replace with actual admin email
    subject: subject,
    html: message,
    templateParams: {
      request_id: requestData.id,
      patient_name: requestData.patientName,
      blood_group: requestData.bloodGroup,
      urgency: requestData.urgency,
      hospital_name: requestData.hospitalName,
      contact_person: requestData.contactPerson,
      contact_phone: requestData.contactPhone
    }
  });
};

/**
 * Send blood request approval notification
 */
export const sendRequestApprovalNotification = async (requestData, status, rejectionReason = null) => {
  const subject = status === 'approved' 
    ? `✅ Blood Request Approved - ID: ${requestData.id.substring(0, 8)}`
    : `❌ Blood Request ${status.toUpperCase()} - ID: ${requestData.id.substring(0, 8)}`;

  const message = status === 'approved'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Blood Request Approved</h2>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #15803d;"><strong>Great news! Your blood request has been approved.</strong></p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Request Summary</h3>
          <p><strong>Request ID:</strong> ${requestData.id}</p>
          <p><strong>Patient:</strong> ${requestData.patientName}</p>
          <p><strong>Blood Group:</strong> ${requestData.bloodGroup}</p>
          <p><strong>Units Approved:</strong> ${requestData.unitsRequired}</p>
          <p><strong>Hospital:</strong> ${requestData.hospitalName}</p>
          <p><strong>Required By:</strong> ${new Date(requestData.requiredBy).toLocaleString()}</p>
        </div>
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1d4ed8; margin-top: 0;">Next Steps:</h4>
          <ol style="color: #1e40af;">
            <li>Contact the blood bank to coordinate collection</li>
            <li>Bring this approval email and proper identification</li>
            <li>Ensure medical staff is ready for transfusion</li>
          </ol>
        </div>
        
        <p style="color: #6b7280;">For any questions, please contact us immediately.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Blood Request ${status.toUpperCase()}</h2>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>Your blood request could not be approved at this time.</strong></p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Request Details</h3>
          <p><strong>Request ID:</strong> ${requestData.id}</p>
          <p><strong>Patient:</strong> ${requestData.patientName}</p>
          <p><strong>Blood Group:</strong> ${requestData.bloodGroup}</p>
          <p><strong>Units Requested:</strong> ${requestData.unitsRequired}</p>
        </div>
        
        ${rejectionReason ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin-top: 0;">Reason:</h4>
            <p style="color: #dc2626; margin-bottom: 0;">${rejectionReason}</p>
          </div>
        ` : ''}
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1d4ed8; margin-top: 0;">Alternative Options:</h4>
          <ul style="color: #1e40af;">
            <li>Contact other nearby hospitals or blood banks</li>
            <li>Reach out to local donor communities</li>
            <li>Submit a new request with updated information</li>
          </ul>
        </div>
        
        <p style="color: #6b7280;">For assistance, please contact us immediately at [emergency contact].</p>
      </div>
    `;

  return sendEmail({
    to: requestData.contactEmail,
    subject: subject,
    html: message,
    templateParams: {
      request_id: requestData.id,
      patient_name: requestData.patientName,
      status: status,
      hospital_name: requestData.hospitalName,
      rejection_reason: rejectionReason
    }
  });
};

/**
 * Send donor eligibility notification
 */
export const sendDonorEligibilityNotification = async (donorData, isEligible, reasons = []) => {
  const subject = isEligible 
    ? '✅ Blood Donation Eligibility - You\'re Eligible!'
    : '❌ Blood Donation Eligibility Update';

  const message = isEligible
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🩸 You're Eligible to Donate Blood!</h2>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #15803d;"><strong>Congratulations! Your eligibility check shows you can donate blood.</strong></p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Your Profile</h3>
          <p><strong>Name:</strong> ${donorData.fullName}</p>
          <p><strong>Blood Group:</strong> ${donorData.bloodGroup}</p>
          <p><strong>Phone:</strong> ${donorData.phone}</p>
        </div>
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1d4ed8; margin-top: 0;">Ready to Save Lives?</h4>
          <p style="color: #1e40af;">Your ${donorData.bloodGroup} blood type is valuable and needed. Thank you for your willingness to help save lives!</p>
        </div>
        
        <p style="color: #6b7280;">We'll contact you when blood donations of your type are needed in your area.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Blood Donation Eligibility Update</h2>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626;"><strong>You're currently not eligible to donate blood.</strong></p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Eligibility Factors</h3>
          <ul>
            ${reasons.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #d97706; margin-top: 0;">Don't Worry!</h4>
          <p style="color: #92400e;">Many eligibility factors are temporary. You can recheck your eligibility in the future.</p>
        </div>
        
        <p style="color: #6b7280;">Thank you for your interest in saving lives through blood donation.</p>
      </div>
    `;

  return sendEmail({
    to: donorData.email,
    subject: subject,
    html: message,
    templateParams: {
      donor_name: donorData.fullName,
      blood_group: donorData.bloodGroup,
      eligible: isEligible,
      reasons: reasons.join(', ')
    }
  });
};

/**
 * Send contact form message
 */
export const sendContactMessage = async (contactData) => {
  const subject = `New Contact Message from ${contactData.name}`;
  
  // Simple text message without HTML
  const message = `
📧 NEW CONTACT MESSAGE

Contact Details:
- Name: ${contactData.name}
- Email: ${contactData.email}
- Date: ${new Date().toLocaleString()}

Message:
${contactData.message}

---
Please respond to this inquiry promptly.
Blood Donation System Team
  `;

  return sendEmail({
    to: 'admin@bloodbank.com', // Replace with your admin email
    toName: 'Blood Bank Admin',
    subject: subject,
    message: message,
    userName: contactData.name,
    userEmail: contactData.email,
    userMessage: contactData.message,
    fromName: 'Blood Donation System',
    templateType: 'apply',
    templateParams: {
      contact_name: contactData.name,
      contact_email: contactData.email,
      contact_message: contactData.message,
      sent_date: new Date().toLocaleString(),
      subject: subject
    }
  });
};

/**
 * Send low inventory alert to hospital administrators
 */
export const sendLowInventoryAlert = async (hospitalData, lowStockItems) => {
  const subject = '⚠️ Low Blood Inventory Alert';
  
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">⚠️ Low Blood Inventory Alert</h2>
      
      <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Attention: Your blood inventory is running low for the following blood types.</strong></p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Hospital: ${hospitalData.name}</h3>
        <h4 style="color: #dc2626;">Low Stock Items:</h4>
        <ul>
          ${lowStockItems.map(item => `
            <li><strong>${item.bloodGroup}:</strong> ${item.currentStock} units remaining (Minimum: ${item.minimumRequired})</li>
          `).join('')}
        </ul>
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #dc2626; margin-top: 0;">Immediate Action Required:</h4>
        <ol style="color: #dc2626;">
          <li>Contact local blood banks for emergency supply</li>
          <li>Activate donor recruitment campaigns</li>
          <li>Consider postponing non-emergency procedures</li>
          <li>Notify medical staff of current situation</li>
        </ol>
      </div>
      
      <p style="color: #6b7280;">This is an automated alert. Please take immediate action to ensure patient safety.</p>
    </div>
  `;

  return sendEmail({
    to: hospitalData.email,
    subject: subject,
    html: message,
    templateParams: {
      hospital_name: hospitalData.name,
      low_stock_count: lowStockItems.length
    }
  });
};