<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Marknest Login Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #5b21b6;
        }
        .otp-code {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-number {
            font-size: 32px;
            font-weight: bold;
            color: #5b21b6;
            letter-spacing: 8px;
        }
        .magic-link-button {
            display: inline-block;
            background: #5b21b6;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            margin: 20px auto;
            display: block;
            text-align: center;
            width: fit-content;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 10px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✍️ Marknest</div>
        </div>
        
        <h2>Welcome back!</h2>
        
        <p>You requested a login code for your Marknest account. Here's your one-time password:</p>
        
        <div class="otp-code">
            <div class="otp-number">{{ $otp }}</div>
            <p style="margin: 10px 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
        </div>
        
        <p style="text-align: center;">Or click the button below to log in directly:</p>
        
        <a href="{{ $magicLink }}" class="magic-link-button">
            Log in to Marknest
        </a>
        
        <div class="warning">
            ⚠️ If you didn't request this login code, please ignore this email. Your account remains secure.
        </div>
        
        <div class="footer">
            <p>This is an automated message from Marknest. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Marknest. All rights reserved.</p>
        </div>
    </div>
</body>
</html>