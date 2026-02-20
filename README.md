# Palouse-Alliance-Community-Resource-Platform

## Project summary
The Palouse Alliance Community Resource Platform is a digital initiative designed to make community health and wellness resources easier to find and easier to use across the Palouse region. Residents often need help quickly, but services are frequently scattered across separate nonprofit sites, county and state pages, flyers, and social media posts. That fragmentation creates real friction. People may not know what exists, which organization to contact, or whether information is still current. This platform addresses that gap by organizing trusted resources in one place and presenting them through a clear, searchable interface.

The platform is intended to support a wide range of users, including students, families, seniors, veterans, and individuals seeking housing support, food assistance, mental health services, or community programs. Rather than forcing residents to learn multiple websites and terminology, the platform will provide consistent categories, filters, and plain language descriptions. It will also highlight upcoming events and deadlines through a shared community calendar so residents can plan ahead instead of finding information at the last minute.

Accessibility is a core goal. The project will follow established accessibility guidance so that residents using assistive technologies, mobile devices, or limited bandwidth can still access critical information. In addition, the platform supports the organizations behind the services by reducing repeated outreach work and enabling simpler updates. Over time, this creates a more reliable community information hub, improves coordination among participating groups, and reduces the information gaps that can prevent people from getting help.

### One-sentence description of the project
The Palouse Alliance Community Resource Platform is a digital initiative designed to make community health and wellness resources easier to find and easier to use across the Palouse region.

### Additional information about the project
The Palouse Alliance Community Resource Platform will offer a community calendar and tools for organizations to post flyers for events, and meeting dates. Some core requirements include accessibility and responsiveness, the site should be available on laptop, tablet, and mobile devices, with support for those with disabilities. Members of the Alliance can keep their listing current and share announcements. Visitors will be able to filter to make it easier to connect with the relevant event hosts. The calendar shows upcoming deadlines and events, while admins can moderate what is being posted to ensure the content is accurate and appropriate for the community. Technical development will rely on modern web HTML frameworks. By focusing on making the website easy to use for the public and members, the project aims to improve events and lower barriers for everyone.

We expect to see increased discoverability and accessibility, better coordination, and a scalable platform that can be extended or adapted to future needs. We also aim to reduce the manpower required to post events and meeting dates so members can better focus on the community.

## Installation
### Prerequisites
Git, React, Next.js, and Supabase.

### Add-ons
Our application has no add-ons, just packages and tools installed while setting up the project.

### Installation Steps
Since our application connects to a specific Supabase database project that cannot be accessed publicly for security reasons, you will not be able to interact with actual data unless you have access to our Supabase environment. However, you can still set up and view the application locally using React and Next.js.

Follow these steps to get started:

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install Dependencies**
   Make sure you have [Node.js](https://nodejs.org/) (preferably the latest LTS version) and [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create Environment Variables**
   Copy the example environment file and update any variables as needed. If you don't have access to the Supabase credentials, the app will run in a limited/demo mode (as available).
   ```bash
   cp .env.example .env.local
   ```
   > Fill in your Supabase keys if you have them. If not, you can skip this step, but some features may not function as expected.

4. **Run the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Your application is now available at [http://localhost:3000](http://localhost:3000).

5. **(Optional) Connect to Your Own Supabase Instance**
   If you wish to experiment with a Supabase backend, you can create your own [Supabase project](https://app.supabase.com/) and update the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.

## Functionality
### 1. Search and Discovery

**a. Search for Services and Events ([FR-1]: Essential)**
- Use the search bar on the homepage or events page to enter keywords.
- Instantly view matching services or events based on your input.

**b. Category-Based Filtering ([FR-2]: Essential)**
- Filter results by categories (e.g., Housing, Health) or event-specific tags using the sidebar or filter controls.

---

### 2. Events and Calendar

**a. Event Calendar Integration ([FR-3]: Essential)**
- Access the public calendar from the "Events" or "Calendar" section.
- View all approved events populated on the calendar interface.
- (Members Only) Add or edit events by filling out the event form.
    - All submissions require admin approval before being publicly visible.

**b. View Flyers and Meetings ([FR-6]: Essential)**
- Browse a visual feed of flyers, events, and upcoming meetings.
- Flyers can be previewed or downloaded if attachments are available.

---

### 3. User Management

**a. Member and Admin Account Management ([FR-4]: Essential)**
- Register as a member by clicking “Become a Member” and completing the sign-up form.
- Sign in with your credentials.
- Account creation requires verification, handled via email/SMS or by an admin (depending on configuration).
- Admin users can manage (approve, disable) accounts via the admin dashboard.

---

### 4. Content Management

**a. Event and Flyer Upload/Approval ([FR-5]: Essential)**
- (Members) Use the upload form to submit details and attachments (e.g., PDFs, images).
- The workflow is designed to be as simple as sending an email.
- Uploaded content appears pending until reviewed and approved by an admin.
- Admin approval is done through the moderation panel.

**b. Organization and Agency Listings ([FR-7]: Desirable)**
- Visit the "Community" page to browse a directory of listed community agencies and members.

---

### 5. Information Display and Privacy

**a. Display Contact Information ([FR-8]: Essential)**
- All event listings and agency pages show relevant public contact information.

**b. Selective Display of Personal Information ([FR-9]: Desirable)**
- When registering or posting, choose which optional information to display.
- Disclaimers clarify which info is public/private.

---

### 6. Volunteer and Community Features

**a. GivePulse Integration ([FR-10]: Essential)**
- Access the dedicated GivePulse section to find volunteer opportunities.
- Click the GivePulse integration link to join or manage volunteer activities.

---

### 7. Platform Support and Analytics

**a. Analytics and Attendance Tracking ([FR-11]: Optional)**
- (Admin) Access analytics dashboards to view registration counts, attendance, and site usage patterns.

**b. Custom Domain Name Support ([FR-12]: Desirable)**
- The site can be deployed to your chosen custom domain (setup instructions in installation).

**c. Branding and Theming ([FR-13]: Desirable)**
- The interface matches stakeholder-provided branding (logos, themes).

**d. Responsive Web Design ([FR-14]: Essential)**
- The application automatically adapts for laptop, tablet, and mobile displays.

**e. Search Engine Display ([FR-15]: Optional)**
- Content is optimized to appear in web search engine results.

**f. Email Notifications for New Resources ([FR-16]: Essential)**
- Automatic email notifications are sent to all members whenever a new resource is posted.

---

## Non-Functional Requirements Highlights

- **Usability:** Designed to be intuitive, with accessibility features and low barriers to content upload.
- **Scalability:** Handles growth in users and events with strong performance.
- **Reliability:** 99% uptime target, with minimal planned downtime.
- **Maintainability:** Modular code structure, version control, and comprehensive documentation.
- **Security/Privacy:** Secure data management, authentication, and user control over public profile fields.
- **Platform Compatibility:** Works across modern browsers and devices.
- **Brand Consistency:** Consistently applies the provided logos, palette, and branding guidelines.

## Known Problems
There are no known problems currently. To see an updated list, please visit the [Issues](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues) tab.

## Additional Documentation
* [Sprint Documents](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/Sprints) (includes Meeting Minutes, presentations, and sprint reports)
* User links
