# Future Features

### Business Logic

#### TEMPLATE OR INSTANCE PAGE / CHAT

#### MODES (might also be called PlayList or ViewLists)

- 23/9/2023
  - Noticing that as as a user constinues to follow multiple accounts, the `following` section of the wems would easily become a cluster of many different ideas, creating a similar unpuposeful / aimless scrolling which is commonly found i other social media.
    To curb this, an idea for bridge is to implement a `mode` feature. This feature would be similar to playlist in musical apps, where the user himself (not an algorithm) organizes the accounts he follows into `modes` e.g space mode, productivity mode, technology mode, musical mode etc. These modes would serve as a subdomains for the accounts a user follows, creating structure and encouraging purposeful usage (scrolling).

#### PRIVACY SETTINGS, DATA MANAGEMENT AND TERMS AND CONDITIOINS.

- 26/9/2023
  - There are some kinda important data management rules that wembee would have to follow. Most of them are unknown to me now, but some examples that I might consider are: GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act).
    These should be included in final touches I would make when the first version of Wembee is a finished product.
    I can also check the existing terms and conditions on othe social sites and try to adapt from theirs.

#### GLOBAL VARIABLES

- 26/9/2023
  - Global variables are a feature that would grant users the ability to store data which they can easily re-use through the app or in a chat environment. They are the predessecors for more intimate variable features like AI memes that are generated using images a user stores and made accessible to it's usable scope variable.

#### ADJUST THE PROCESS OF CREATING A NEW INTEREST TOPIC (SENIOR-ADMIN)

- 18/10/2023
  - When creating a new interest topic, I have to adjust the implementation so that if the process is running and a new interest / interest topic is created, it reflects on the userConfig file and in all the already created users. I will do this by adding the newly created item to the userConfig.INTEREST / .DEFAULT variables so that any new user created automatically recieves this new item. And also, add the newly created item to all the users in the users collection.

#### TIE BRANDED HASHTAG TO SERIES

- 28/10/2023
  - When the series and hashtag features are rolled out, One important idea that should be considered is that:
    A hashtage can be branded (paid), and if the branded hashtag is related to a series, any time the hastag as called, beneath the post containing the hashtag would be a dialogue box that contains details of the series and a button for following the series.
    For example, a business, let's say Apple inc, can create a series for their yearly apple event and they can then get a branded hashtag eg #AppleEvent and when any body post this hastag, a dialogue as proposed appears. The size and number of occurence (if a user can choose to not make it occur) can be discussed in the future.

#### SECURITY AND ACCOUNT CREATION LIMITS USING IP ADDRESS.

- 13/11/2023

  - To prevent a person from creating multiple accounts and running an impersonation schemem, It's best I place a limit on the number of users an IP address can create per year. Likely example:

    - An IP address can only create a maximum of 10 accounts per year.
    - An IP address can only create a maximum of 5 accouts per month.
    - An IP address can only create a maximum of 4 accouts per week.

  I should also take time to notice and analyse how `yahoo` schemes are ran and try to block it's possible entry points.

#### POTENTIAL PPC FEATURE (PEOPLE - PROJECTS - COMMUNICATION).

- 19/11/2023

  - A feature that show cases people or groups and the projects they are working on. Possibly with invites or sponsorship / donations option.

#### INBOX AND DMs FEATURE

- 21/11/2023
  - DMs: Wembox as a platform promotes meeting new people in a secure way, this is visible inform of contactRequests. But not all conversations would and should require a contact request and acceptance. So therefore, the DMs. The DM environment would be volatile, a place where creativity can be shared by passerbys. Easier to access than a contact access and more secure in the sense that a DM doesn't give access to a users private wems.
  - Inbox: The Wembox environment is being designed to be a place professional conversations and talks on creativity would happen effieciently. In the world many times the highest level of creativity, patonising and Interest is often sent through a more formal Email than chat. An idea I have for Wembee attending to this need is by creating an email outlet e.g `@wem.com` or `@wm.com` and adding an ultra-mordern inbox feature to be amongst the DMs and ContactRequest Menu. In this way, Creativity can be shared across the platform and maximum collaboration and hence transation for our users is promoted.

#### WEMBEE PRO (or BOX PRO)

- 21/11/2023

### Frontend

#### ATMOSPHERE AND RESTRICTIONS AROUND SENDING A CONTACT REQUEST

- 21/11/2023
  - When creating the UI for sending a contact request, some guidelines should be followed to maximise the feeling of freedom of a user sending a request while at the same time the user knowing that he / she is protected and presented as relevant if someone else is sending a contact request to them.
    Guidelines to follow might include:
  1. Placing a limit to the number of characters that can be sent to a user. This limit should not be visible until a user exceeds it.
  2. An Input placeholder or component that gives an idea / template of how a user can best send a good request message. e.g A placeholder: Hey! John, Daniel From Kafanchan, borno. It's been a while.
  3. It should not yet be AI generated or recommended (e.g is a list of different approaches, freindy, curious, confused e.t.c) that it won't be nice because we want our user to know he / she is recieving a genuine message. AI generated messages could be watched in the future to determine if it would be useful.
  4. To combat impersonation and phising, limits can be considered to be added on the number of contact request a user can send or have pending.

### Backend

#### OPERATIONS WITH USER GEOLOCATION DATA (from the geoLocation API).

- 13/11/2023

#### Global error handling

I must still create a global error handler for when the process is in production
