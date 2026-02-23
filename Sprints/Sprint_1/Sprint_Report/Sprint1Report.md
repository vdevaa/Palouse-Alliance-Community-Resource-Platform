# Sprint 1 Report (01/20/2026 to 02/22/2026)
## YouTube link of Sprint Video
[Sprint 1 Video](INSERT)

## What's New (User Facing)
* Setup the Supabase database
* Setup the frontend (next.js)
* Created the website header and navbar
* Created the website footer
* Setup Row Level Security (RLS) for our Supabase database

## Work Summary (Developer Facing)
Sprint 1 for the Palouse Alliance Community Research Platform was mostly about getting solid footing on requirements, architecture, and early implementation. We met with the client bi-weekly over Zoom and followed up through email to confirm what the platform actually needs to do, then translated that into initial user stories and use cases like login, submitting events or flyers, admin approval, and public viewing of community listings. At the same time, we reviewed the current process where organizations email event details in, which can be slow or easy to miss, and started shaping a workflow where members can submit directly through the site and admins can quickly approve posts. On the technical side, we chose a React plus Vite frontend with Supabase for the backend and database, then built out the project skeleton with routing, a consistent header and footer, and an early login page that's frontend-only for now since account management decisions are still being finalized with the client. We also drafted a database schema and set up Supabase row level security defaults using triggers, so the foundation is ready once auth and data flows are locked in. A few backend pieces had to wait because we were blocked on key login and workflow decisions, but we still made progress by tightening the UI blueprint, documenting the plan, and leveling up on React structure, layout styling, and Supabase security patterns. Going into Sprint 2, we're aiming to finalize the account workflow, connect the database to the current UI, start calendar integration, and push toward real end to end functionality.

## Unfinished Work
We finished everything we were hoping to for this sprint.

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:
* [Setup Database](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/15)
* [Setup Frontend](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/17)
* [Website Header/Navbar](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/14)
* [Website Footer](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/16)
* [Setup Row Level Security for Supabase](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/19)
* [Feature/setup frontend](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/pull/20)

## Incomplete Issues/User Stories
Here are links to issues we worked on but did not complete in this sprint:
* [Design Schema and ER Model for Database](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/18): This feature was delayed to Sprint 2 becuase we are awaiting final confirmation from our clients, which will be discussed during our next meeting. This is okay to be pushed to a later sprint since not all tables were needed for this first sprint.

## Code Files for Review
Please review the following code files, which were actively developed during this
sprint, for quality:
* [Admin.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Admin.jsx): Setup empty page and navigation to it
* [Dashboard.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Dashboard.jsx): Setup empty page and navigation to it
* [Home.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Home.jsx): Setup empty page and navigation to it
* [Login.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Login.jsx): Setup empty page and navigation to it
* [Organizations.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Organizations.jsx): Setup empty page and navigation to it
* [PostEvent.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/PostEvent.jsx): Setup empty page and navigation to it
* [Register.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/frontend/src/pages/Register.jsx): Setup empty page and navigation to it

## Retrospective Summary
Here's what went well:
* We got a comphrehensive idea for the requirements of our project, that was our goal this sprint.
* In addition to the above, we were ahead on schedule and were able to start working on features like the website header and footer. Our target was requirement gathering and seting up our tech stack, both of which we completed.

Here's what we'd like to improve:
* We all go our tasks done (with extra), there isn't anything we can do to improve becuase we got more than expected done and worked well together. Something extra was to take more initiative on unassigned or lesser priority tasks for future sprints, this sprint didn't have many, but future sprints would.

Here are changes we plan to implement in the next sprint:
* We plan to setup the database to support the tables and RLS we need for our chosen sprint 2 tasks.
* We plan to continue working on the frontend to better match the mockups we created and got approved by the clients.
