<?php

namespace Rentopia\Utils;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Mailer Utility Class for Rentopia
 * Handles all email notifications using PHPMailer with Gmail SMTP
 */
class Mailer
{
    private $mail;
    private $isConfigured = false;

    public function __construct()
    {
        $this->mail = new PHPMailer(true);

        try {
            // Check if SMTP is configured
            if (empty($_ENV['SMTP_USER']) || empty($_ENV['SMTP_PASS'])) {
                error_log("Mailer: SMTP credentials not configured");
                return;
            }

            // SMTP Configuration for Gmail
            $this->mail->isSMTP();
            $this->mail->Host = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $_ENV['SMTP_USER'];
            $this->mail->Password = $_ENV['SMTP_PASS'];
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = (int) ($_ENV['SMTP_PORT'] ?? 587);

            // Sender Configuration
            $fromEmail = $_ENV['SMTP_FROM'] ?? $_ENV['SMTP_USER'];
            $fromName = $_ENV['SMTP_FROM_NAME'] ?? 'Rentopia';
            $this->mail->setFrom($fromEmail, $fromName);

            // Email settings
            $this->mail->isHTML(true);
            $this->mail->CharSet = 'UTF-8';

            $this->isConfigured = true;
        } catch (Exception $e) {
            error_log("Mailer configuration error: " . $e->getMessage());
        }
    }

    /**
     * Send booking notification email to property owner
     */
    public function sendBookingNotificationToOwner($ownerEmail, $ownerName, $bookingDetails, $propertyDetails)
    {
        if (!$this->isConfigured) {
            error_log("Mailer: Cannot send email - SMTP not configured");
            return false;
        }

        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($ownerEmail, $ownerName);

            // Format dates
            $checkIn = $this->formatDate($bookingDetails['checkIn']);
            $checkOut = $this->formatDate($bookingDetails['checkOut']);

            $this->mail->Subject = "🎉 New Booking for " . ($propertyDetails['title'] ?? 'Your Property') . "!";

            $this->mail->Body = $this->getOwnerEmailTemplate([
                'ownerName' => $ownerName,
                'propertyTitle' => $propertyDetails['title'] ?? 'Your Property',
                'propertyAddress' => $propertyDetails['address'] ?? '',
                'guestName' => $bookingDetails['name'] ?? 'Guest',
                'guestPhone' => $bookingDetails['phone'] ?? 'N/A',
                'checkIn' => $checkIn,
                'checkOut' => $checkOut,
                'numberOfGuests' => $bookingDetails['numberOfGuests'] ?? 1,
                'totalAmount' => $bookingDetails['price'] ?? 0,
                'bookingId' => $bookingDetails['_id'] ?? ''
            ]);

            $this->mail->AltBody = $this->getOwnerPlainTextEmail([
                'ownerName' => $ownerName,
                'propertyTitle' => $propertyDetails['title'] ?? 'Your Property',
                'guestName' => $bookingDetails['name'] ?? 'Guest',
                'checkIn' => $checkIn,
                'checkOut' => $checkOut,
                'numberOfGuests' => $bookingDetails['numberOfGuests'] ?? 1,
                'totalAmount' => $bookingDetails['price'] ?? 0
            ]);

            $this->mail->send();
            error_log("Mailer: Booking notification sent to owner: $ownerEmail");
            return true;
        } catch (Exception $e) {
            error_log("Mailer: Failed to send owner notification: " . $e->getMessage());
            return false;
        }
    }

    
    public function sendPaymentConfirmationToUser($userEmail, $userName, $bookingDetails, $propertyDetails, $paymentDetails)
    {
        if (!$this->isConfigured) {
            error_log("Mailer: Cannot send email - SMTP not configured");
            return false;
        }

        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($userEmail, $userName);

            // Format dates
            $checkIn = $this->formatDate($bookingDetails['checkIn']);
            $checkOut = $this->formatDate($bookingDetails['checkOut']);

            $this->mail->Subject = "✅ Booking Confirmed - " . ($propertyDetails['title'] ?? 'Your Stay');

            $this->mail->Body = $this->getUserEmailTemplate([
                'userName' => $userName,
                'propertyTitle' => $propertyDetails['title'] ?? 'Your Property',
                'propertyAddress' => $propertyDetails['address'] ?? '',
                'propertyPhoto' => $propertyDetails['photos'][0] ?? '',
                'checkIn' => $checkIn,
                'checkOut' => $checkOut,
                'numberOfGuests' => $bookingDetails['numberOfGuests'] ?? 1,
                'totalAmount' => $paymentDetails['amount'] ?? $bookingDetails['price'] ?? 0,
                'paymentStatus' => $paymentDetails['status'] ?? 'confirmed',
                'bookingId' => $bookingDetails['_id'] ?? ''
            ]);

            $this->mail->AltBody = $this->getUserPlainTextEmail([
                'userName' => $userName,
                'propertyTitle' => $propertyDetails['title'] ?? 'Your Property',
                'propertyAddress' => $propertyDetails['address'] ?? '',
                'checkIn' => $checkIn,
                'checkOut' => $checkOut,
                'numberOfGuests' => $bookingDetails['numberOfGuests'] ?? 1,
                'totalAmount' => $paymentDetails['amount'] ?? $bookingDetails['price'] ?? 0,
                'bookingId' => $bookingDetails['_id'] ?? ''
            ]);

            $this->mail->send();
            error_log("Mailer: Payment confirmation sent to user: $userEmail");
            return true;
        } catch (Exception $e) {
            error_log("Mailer: Failed to send user confirmation: " . $e->getMessage());
            return false;
        }
    }

    public function sendSubscriptionConfirmation($userEmail, $userName, $planName, $amount)
    {
        if (!$this->isConfigured) {
            return false;
        }

        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($userEmail, $userName);

            $this->mail->Subject = "✅ Subscription Activated - Rentopia Host";

            $this->mail->Body = <<<HTML
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #F43F5E;">Subscription Active!</h2>
        <p>Hi <strong>$userName</strong>,</p>
        <p>You have successfully subscribed to the <strong>$planName</strong>.</p>
        <p>You can now list your properties on Rentopia.</p>
        <hr>
        <p><strong>Amount Paid:</strong> ₹$amount</p>
        <p><strong>Valid Until:</strong> 1 Year from today</p>
        <hr>
        <p>Happy Hosting!</p>
    </div>
</body>
</html>
HTML;
            $this->mail->AltBody = "Hi $userName, You have successfully subscribed to $planName. Amount: $amount. Happy Hosting!";

            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Mailer: Subscription email failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format MongoDB date to readable format
     */
    private function formatDate($date)
    {
        if (is_array($date) && isset($date['$date'])) {
            // MongoDB extended JSON format
            if (isset($date['$date']['$numberLong'])) {
                $timestamp = (int) $date['$date']['$numberLong'] / 1000;
            } else {
                $timestamp = strtotime($date['$date']);
            }
            return date('D, M j, Y', $timestamp);
        } elseif (is_string($date)) {
            return date('D, M j, Y', strtotime($date));
        } elseif (is_object($date) && method_exists($date, 'toDateTime')) {
            return $date->toDateTime()->format('D, M j, Y');
        }
        return $date;
    }

    /**
     * HTML Email Template for Property Owner
     */
    private function getOwnerEmailTemplate($data)
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #F43F5E 0%, #EC4899 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 New Booking!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You have a new guest!</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                                Hi <strong>{$data['ownerName']}</strong>,
                            </p>
                            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                Great news! Someone has booked your property. Here are the details:
                            </p>
                            
                            <!-- Property Card -->
                            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                                <h3 style="color: #F43F5E; margin: 0 0 15px 0; font-size: 18px;">📍 {$data['propertyTitle']}</h3>
                                <p style="color: #666; margin: 0; font-size: 14px;">{$data['propertyAddress']}</p>
                            </div>
                            
                            <!-- Guest Details -->
                            <div style="background: #fff7ed; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #F97316;">
                                <h4 style="color: #9a3412; margin: 0 0 15px 0; font-size: 16px;">👤 Guest Information</h4>
                                <table width="100%" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #666; padding: 5px 0;">Name:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['guestName']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 5px 0;">Phone:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['guestPhone']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 5px 0;">Guests:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['numberOfGuests']}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Booking Details -->
                            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #22C55E;">
                                <h4 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">📅 Booking Details</h4>
                                <table width="100%" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #666; padding: 5px 0;">Check-in:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['checkIn']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 5px 0;">Check-out:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['checkOut']}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Amount -->
                            <div style="background: linear-gradient(135deg, #F43F5E 0%, #EC4899 100%); border-radius: 12px; padding: 20px; text-align: center;">
                                <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px 0; font-size: 14px;">Total Earnings</p>
                                <p style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">₹{$data['totalAmount']}</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Please ensure the property is ready for your guest's arrival.
                            </p>
                            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 Rentopia. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    /**
     * HTML Email Template for User (Payment Confirmation)
     */
    private function getUserEmailTemplate($data)
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your payment was successful</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                                Hi <strong>{$data['userName']}</strong>,
                            </p>
                            <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                Thank you for your booking! Your payment has been confirmed. Here are your booking details:
                            </p>
                            
                            <!-- Property Card -->
                            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                                <h3 style="color: #F43F5E; margin: 0 0 10px 0; font-size: 20px;">🏠 {$data['propertyTitle']}</h3>
                                <p style="color: #666; margin: 0; font-size: 14px;">📍 {$data['propertyAddress']}</p>
                            </div>
                            
                            <!-- Booking Details -->
                            <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #3B82F6;">
                                <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📅 Stay Details</h4>
                                <table width="100%" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Check-in:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['checkIn']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Check-out:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['checkOut']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Guests:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right;">{$data['numberOfGuests']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Booking ID:</td>
                                        <td style="color: #333; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px;">{$data['bookingId']}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Payment Details -->
                            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #22C55E;">
                                <h4 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">💳 Payment Details</h4>
                                <table width="100%" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Amount Paid:</td>
                                        <td style="color: #22C55E; font-weight: 700; text-align: right; font-size: 18px;">₹{$data['totalAmount']}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;">Status:</td>
                                        <td style="text-align: right;">
                                            <span style="background: #22C55E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- CTA -->
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">Have a wonderful stay! 🌟</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                Questions about your booking? Reply to this email.
                            </p>
                            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 Rentopia. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    /**
     * Plain text email for owner (fallback)
     */
    private function getOwnerPlainTextEmail($data)
    {
        return <<<TEXT
Hi {$data['ownerName']},

Great news! You have a new booking for your property.

Property: {$data['propertyTitle']}
Guest: {$data['guestName']}
Check-in: {$data['checkIn']}
Check-out: {$data['checkOut']}
Guests: {$data['numberOfGuests']}
Total Amount: ₹{$data['totalAmount']}

Please ensure the property is ready for your guest's arrival.

Best regards,
Team Rentopia
TEXT;
    }

    /**
     * Plain text email for user (fallback)
     */
    private function getUserPlainTextEmail($data)
    {
        return <<<TEXT
Hi {$data['userName']},

Your booking has been confirmed! Here are the details:

Property Details:
- Name: {$data['propertyTitle']}
- Address: {$data['propertyAddress']}
- Check-in: {$data['checkIn']}
- Check-out: {$data['checkOut']}
- Guests: {$data['numberOfGuests']}

Payment Details:
- Amount Paid: ₹{$data['totalAmount']}
- Status: Confirmed
- Booking ID: {$data['bookingId']}

Have a wonderful stay!

Best regards,
Team Rentopia
TEXT;
    }
}
