import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Mock Email sent to:", email);
      return NextResponse.json({ success: true, mock: true });
    }

    const { data, error } = await resend.emails.send({
      from: "Evora Team <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Evora 🚀",
      html: `
        <div style="font-family: sans-serif; color: #111;">
          <h2>Hi ${name},</h2>
          <p>Welcome aboard! 🚀</p>
          <p>We are thrilled to let you know that your account on Evora has been successfully created. You are now officially part of our growing community of innovators and tech enthusiasts.</p>
          <p>Here is what you can do next:</p>
          <ul>
            <li><strong>Explore Upcoming Events:</strong> Browse through our latest hackathons, tech summits, and workshops.</li>
            <li><strong>Secure Your Spot:</strong> Register for events with just one click and manage all your tickets in one place.</li>
            <li><strong>Stay Updated:</strong> Get real-time announcements directly on your student dashboard.</li>
          </ul>
          <p>
            <a href="https://tumhari-website.vercel.app/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #22d3ee; color: #000; font-weight: bold; text-decoration: none; border-radius: 5px;">
              Go to My Dashboard
            </a>
          </p>
          <h3>Your Login Details:</h3>
          <p><strong>Registered Email:</strong> ${email}</p>
          <p style="font-size: 12px; color: #666;">
            (Note: For security reasons, we do not share passwords over email. If you ever forget it, just use the 'Forgot Password' link on the login page).
          </p>
          <p>If you face any issues or have questions, feel free to reply to this email or reach out to our support team.</p>
          <p>Get ready to build, network, and innovate!</p>
          <p>Best Regards,<br><strong>The Evora Team</strong></p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
