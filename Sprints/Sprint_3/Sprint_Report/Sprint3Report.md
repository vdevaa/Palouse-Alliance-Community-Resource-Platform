# Sprint 2 Report (03/24/2026 to 05/01/2026)
## YouTube link of Sprint Video
[Sprint 3 Video](INSERT)

## What's New (User Facing)
* We gave the landing page a better layout so visitors can see next steps right away.
* A new Palouse Resources Guide now lives in the navbar so people can find local services.
* You can search for services and events in one place, and narrow results with category and tag filters to get what you need faster.
* Organization pages now let you filter events on the fly so it's easy to spot relevant activities from a specific group.
* Organizations can submit events and flyers now, and those submissions go through an approval process so published content is moderated.
* Event authors will see rejected submissions in a new Rejected section under My Events.
* Members can sign up and log in, and the navigation bar adapts to your login state so the register button won't show up where it's confusing or redundant.
* We added basic automated tests to protect these new flows and help keep the site stable as we continue to build.

## Work Summary (Developer Facing)
We knocked out a mix of front end and backend work this sprint and focused on making discovery and content management smoother. On the front end we rebuilt the landing page, added the Palouse Resources Guide to the navbar, implemented search UI plus category and tag filters, and shipped dynamic event filtering on organization pages. We also added the My Events rejected section and cleaned up navbar behavior so the register control displays only when appropriate. Styling updates landed across theme.css and the styles folder, and several reusable components in /components were refactored for clarity and reuse.

On the backend we implemented the event and flyer approval workflow and created row level security policies to support the new feature set, and we wired member registration into the auth flow. App.jsx received adjustments around session handling, URL forwarding, and caching logic. We merged a baseline test suite (see App.test.jsx and PR #45) to cover new behaviors and prevent regressions. Along the way we fixed a handful of UI bugs discovered during testing and updated API contracts where needed. The codebase is in a stable state and ready for the next sprint, where we'll finish flyer storage and retrieval, add event retention, and start on analytics and notifications.

## Unfinished Work
We finished everything we were hoping to for this sprint (and more)!

## Completed Issues/User Stories
Here are links to the issues that we completed in this sprint:
* [Landing Page Revamp](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/46)
* [Event/Flyer Approval](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/7)
* [Palouse Resources Guide in NavBar](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/55)
* [Dynamic Organization Event Filtering](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/32)
* [Search for Services and Events](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/1)
* [Category and Tag Based Filtering](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/2)
* [Add rejected sections for My Events](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/50)
* [Member Registration](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/4)
* [Create RLS for Sprint 3 Features](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/37)
* [Remove register button for navbar when logged in as a member or logged out](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/issues/41)
* [Added basic tests for all current features](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/pull/45)

## Code Files for Review
Please review the following code files, which were actively developed during this sprint, for quality:
* [App.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/src/App.jsx): Contains the main logic like website URL forwarding and management, who is logged in, and caching.
* [App.test.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/src/App.test.jsx): The file containing tests for [App.jsx](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/src/App.jsx).
* [theme.css](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/blob/main/code/src/theme.css): Contains the main theming for the platform, all aspects of the UI reference this styling in some way.
* [/styles](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/code/src/styles): Contains all of the .css styling for all pages.
* [/pages](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/code/src/pages): Contains the code for all of the pages, supported by components and tests.
* [/components](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/code/src/components): Contains reusable components like the footer, navbar, popup, and event card/calendar.

## Retrospective Summary
Here's what went well:
* Bi-weekly meetings were enough to get feedback and have time for us to work.
* Members attended meetings on time, and were cooperative when rescheduling was needed.

Here's what we'd like to improve:
* We all got our tasks done and more, there isn't anything we can do to improve becuase we got more than expected done and worked well together.

Here are changes we plan to implement in the next sprint:
* Adding Members to the Platfrom from Client
* Finalizing Flyer Storage and Retrieval
* Event Retention (in Supabase)
* Analytics and Attendance Tracking (client mentioned not wanting this do to it being a redundant feature)
* Email Notifications
