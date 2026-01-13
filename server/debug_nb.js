const NeverBounce = require('neverbounce').default;
require('dotenv').config();

// Initialize NeverBounce client
console.log(process.env.NEVERBOUNCE_API_KEY);
const client = new NeverBounce({ apiKey: process.env.NEVERBOUNCE_API_KEY });

// Verify an email with async/await
async function verifyEmail() {
    try {
        // You can request additional information like address_info and credits_info
        const result = await client.single.check('support@neverbounce.com', true, true);

        console.log('Result: ' + result.getResult()); // prints: "valid"
        console.log('Result (numeric): ' + result.getNumericResult());
        console.log('Is Valid? ' + result.is(NeverBounce.result.valid));

        // Access the response data with proper typing
        const response = result.getResponse();

        if (response.address_info) {
            console.log('Host: ' + response.address_info.host);
        }

        if (response.credits_info) {
            console.log('Free Credits Used: ' + response.credits_info.free_credits_used);
            console.log('Paid Credits Used: ' + response.credits_info.paid_credits_used);
        }
    } catch (err) {
        // Errors are thrown and can be caught to handle specific error types
        if (err instanceof Error) {
            switch (err.type) {
                case NeverBounce.errors.AuthError:
                    console.log('AuthError');
                    // The API credentials used are bad, have you reset them recently?
                    break;
                case NeverBounce.errors.BadReferrerError:
                    console.log('BadReferrerError');
                    // The script is being used from an unauthorized source, you may need to
                    // adjust your app's settings to allow it to be used from here
                    break;
                case NeverBounce.errors.ThrottleError:
                    console.log('ThrottleError');
                    // Too many requests in a short amount of time, try again shortly or adjust
                    // your rate limit settings for this application in the dashboard
                    break;
                case NeverBounce.errors.GeneralError:
                    console.log('GeneralError');
                    // A non recoverable API error occurred check the message for details
                    break;
                default:
                    // Other non specific errors
                    console.error('Error:', err.message);
                    break;
            }
        } else {
            console.error('Unknown error:', err);
        }
    }
}

verifyEmail();