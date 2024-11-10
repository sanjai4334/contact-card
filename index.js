const express = require('express');
const app = express();
const PORT = 3000;

app.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch contact data from your API
        const response = await fetch(`https://contact-manager-fn1i.onrender.com/api/contacts/${userId}`);
        const { contact } = await response.json();

        // Define HTML structure with embedded data
        const responseHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${contact.firstName} ${contact.lastName}'s Contact Card</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                <!-- FontAwesome CDN for icons -->
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
            </head>

            <body>
                <div class="min-vh-100">
                    <div class="bg-primary text-white py-5">
                        <div class="container text-center">
                            <h1 class="display-4 fw-bold">${contact.namePrefix || ''} ${contact.firstName} ${contact.middleName || ''} ${contact.lastName} ${contact.nameSuffix || ''}</h1>
                            ${contact.company ? `<h3><i class="fas fa-building me-2"></i>${contact.company}</h3>` : ''}
                            
                            <div class="mt-4 d-flex justify-content-center gap-3">
                                <button class="btn btn-light btn-lg rounded-pill px-4">
                                    <i class="fas fa-download me-2"></i>Add to Contacts
                                </button>

                                <button id="shareButton" class="btn btn-light btn-lg rounded-pill px-4" data-url="https://yourwebsite.com/${contact._id}">
                                    <i class="fas fa-share me-2"></i>Share
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="container py-5">
                        <div class="row g-4">
                            <!-- Contact Details -->
                            ${(contact.phones.length || contact.emails.length) ? `
                                <div class="col-lg-6">
                                    <div class="bg-light p-4 rounded-3 h-100">
                                        <h3>Contact Details</h3>
                                        ${contact.phones.map(phone => `
                                            <div>
                                                <span class="text-muted">${phone.label}</span>
                                                <p class="fs-5">
                                                    <i class="fas fa-phone-alt text-primary me-2"></i>
                                                    <a href="tel:${phone.number}" class="text-decoration-none">${phone.number}</a>
                                                </p>
                                            </div>`).join('')}
                                        ${contact.emails.map(email => `
                                            <div>
                                                <span class="text-muted">${email.label}</span>
                                                <p class="fs-5">
                                                    <i class="fas fa-envelope text-primary me-2"></i>
                                                    <a href="mailto:${email.address}" class="text-decoration-none">${email.address}</a>
                                                </p>
                                            </div>`).join('')}
                                    </div>
                                </div>` : ''}

                            <!-- Social Media -->
                            ${Object.entries(contact.socialMedia).some(([_, url]) => url) ? `
                            <div class="col-lg-6">
                                <div class="bg-light p-4 rounded-3 h-100">
                                    <h3>Social Media</h3>
                                    ${Object.entries(contact.socialMedia).map(([platform, url]) => {
                                        if (!url) return '';
                                        const icons = {
                                            linkedin: 'fab fa-linkedin',
                                            twitter: 'fab fa-twitter',
                                            facebook: 'fab fa-facebook',
                                            instagram: 'fab fa-instagram'
                                        };
                                        return `
                                            <a href="${url}" target="_blank" class="btn btn-outline-${platform} btn-lg w-100 my-2">
                                                <i class="${icons[platform] || 'fas fa-link'} me-2"></i>
                                                ${platform.charAt(0).toUpperCase() + platform.slice(1)}
                                            </a>`;
                                    }).join('')}
                                </div>
                            </div>` : ''}

                            <!-- Important Dates -->
                            ${contact.significantDates && contact.significantDates.length ? `
                                <div class="col-lg-6">
                                    <div class="bg-light p-4 rounded-3 h-100">
                                        <h3>Important Dates</h3>
                                        ${contact.significantDates.map(date => `
                                            <div>
                                                <span class="text-muted">${date.label}</span>
                                                <p class="fs-5"><i class="fas fa-calendar-alt text-primary me-2"></i>${date.date}</p>
                                            </div>`).join('')}
                                    </div>
                                </div>` : ''}

                            <!-- Custom Fields -->
                            ${contact.customFields && contact.customFields.length ? `
                                <div class="col-lg-6">
                                    <div class="bg-light p-4 rounded-3 h-100">
                                        <h3>Additional Information</h3>
                                        ${contact.customFields.map(field => {
                                            let fieldContent = '';
                                            if (field.type === 'URL') {
                                                fieldContent = `<a href="${field.value}" target="_blank" class="text-decoration-none">${field.value}</a>`;
                                            } else if (field.type === 'Email') {
                                                fieldContent = `<a href="mailto:${field.value}" class="text-decoration-none">${field.value}</a>`;
                                            } else {
                                                fieldContent = field.value;
                                            }
                                            return `
                                                <div>
                                                    <span class="text-muted">${field.label}</span>
                                                    <p class="fs-5"><i class="fas ${field.type === 'URL' ? 'fa-link' : field.type === 'Email' ? 'fa-envelope' : 'fa-font'} text-primary me-2"></i>${fieldContent}</p>
                                                </div>`;
                                        }).join('')}
                                    </div>
                                </div>` : ''}
                        </div>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
                
                <!-- Share Button Script -->
                <script>
                    const shareButton = document.getElementById('shareButton');
                    if (shareButton && navigator.share) {
                        shareButton.addEventListener('click', () => {
                            const contactUrl = shareButton.getAttribute('data-url');
                            navigator.share({
                                title: '${contact.firstName} ${contact.lastName}\'s Contact Card',
                                text: 'Check out this contact card!',
                                url: contactUrl,
                            }).then(() => {
                                console.log('Contact card shared successfully');
                            }).catch((error) => {
                                console.error('Error sharing contact card:', error);
                            });
                        });
                    } else {
                        // Fallback for browsers that do not support Web Share API
                        shareButton.addEventListener('click', () => {
                            alert('Sharing is not supported on your device or browser.');
                        });
                    }
                </script>
            </body>
            </html>
        `;

        res.send(responseHtml);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching contact data');
    }
});

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));
