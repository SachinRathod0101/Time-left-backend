/**
 * Email templates for various notifications
 */

/**
 * Generate event approval email template
 * @param {Object} event - The approved event
 * @param {Object} user - The event creator
 * @returns {Object} - Email subject and HTML content
 */
exports.eventApprovalTemplate = (event, user) => {
  const subject = `TimeLeft: Your event "${event.title}" has been approved!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TimeLeft</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Good news, ${user.name}!</h2>
        <p>Your event <strong>${event.title}</strong> has been approved and is now visible to other users.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p><strong>Event Details:</strong></p>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Reveal Date:</strong> ${new Date(event.revealDate).toLocaleDateString()}</p>
        </div>
        
        <p>Users can now join your event. You'll receive notifications as people sign up.</p>
        <p>Thank you for creating an event on TimeLeft!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Event</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>TimeLeft - Connect with others through meaningful events</p>
        <p>© ${new Date().getFullYear()} TimeLeft. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
};

/**
 * Generate event rejection email template
 * @param {Object} event - The rejected event
 * @param {Object} user - The event creator
 * @param {String} reason - Reason for rejection
 * @returns {Object} - Email subject and HTML content
 */
exports.eventRejectionTemplate = (event, user, reason) => {
  const subject = `TimeLeft: Update on your event "${event.title}"`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TimeLeft</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Hello, ${user.name}</h2>
        <p>We've reviewed your event <strong>${event.title}</strong> and unfortunately, we cannot approve it at this time.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <p><strong>Reason for rejection:</strong></p>
          <p>${reason || 'The event does not meet our community guidelines.'}</p>
        </div>
        
        <p>You can edit your event and resubmit it for approval. If you have any questions, please contact our support team.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/events/${event._id}/edit" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Your Event</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>TimeLeft - Connect with others through meaningful events</p>
        <p>© ${new Date().getFullYear()} TimeLeft. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
};

/**
 * Generate event join notification email template
 * @param {Object} event - The event being joined
 * @param {Object} eventCreator - The event creator
 * @param {Object} joiningUser - The user joining the event
 * @returns {Object} - Email subject and HTML content
 */
exports.eventJoinNotificationTemplate = (event, eventCreator, joiningUser) => {
  const subject = `TimeLeft: Someone joined your event "${event.title}"!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TimeLeft</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Hello, ${eventCreator.name}!</h2>
        <p>Great news! <strong>${joiningUser.name}</strong> has joined your event <strong>${event.title}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p><strong>Event Details:</strong></p>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
          <p><strong>Current Participants:</strong> ${event.participants.length}/${event.maxParticipants}</p>
        </div>
        
        <p>Remember, participant details will be revealed on ${new Date(event.revealDate).toLocaleDateString()}.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event Details</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>TimeLeft - Connect with others through meaningful events</p>
        <p>© ${new Date().getFullYear()} TimeLeft. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
};

/**
 * Generate event reveal notification email template
 * @param {Object} event - The event being revealed
 * @param {Object} participant - The event participant
 * @param {Array} otherParticipants - Other participants in the event
 * @returns {Object} - Email subject and HTML content
 */
exports.eventRevealTemplate = (event, participant, otherParticipants) => {
  const subject = `TimeLeft: It's time! "${event.title}" participants are revealed!`;
  
  let participantsHtml = '';
  otherParticipants.forEach(user => {
    participantsHtml += `
      <div style="margin-bottom: 15px; display: flex; align-items: center;">
        <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #e0e0e0; margin-right: 15px; overflow: hidden;">
          ${user.photo ? `<img src="${user.photo}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
        </div>
        <div>
          <p style="margin: 0; font-weight: bold;">${user.name}</p>
          <p style="margin: 0; color: #666;">${user.city || 'Location not specified'}</p>
          <p style="margin: 5px 0 0 0;">${user.bio || 'No bio available'}</p>
        </div>
      </div>
    `;
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TimeLeft</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>The wait is over, ${participant.name}!</h2>
        <p>Today is the reveal day for <strong>${event.title}</strong>! You can now see who else is participating in this event.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4F46E5;">
          <p><strong>Event Details:</strong></p>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
        </div>
        
        <h3>Meet Your Fellow Participants:</h3>
        ${participantsHtml}
        
        <p style="margin-top: 20px;">We've also prepared some icebreakers to help you connect with others at the event!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event Details</a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>TimeLeft - Connect with others through meaningful events</p>
        <p>© ${new Date().getFullYear()} TimeLeft. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return { subject, html };
};