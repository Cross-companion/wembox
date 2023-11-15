# Future Features

### Business Logic

#### TEMPLATE OR INSTANCE PAGE / CHAT

#### MODES (might also be called PlayList or ViewLists)

- 23/9/2023
  - Noticing that as as a user constinues to follow multiple accounts, the `following` section of the wems would easily become a cluster of many different ideas, creating a similar unpuposeful / aimless scrolling which is commonly found i other social media.
    To curb this, an idea for bridge is to implement a `mode` feature. This feature would be similar to playlist in musical apps, where the user himself (not an algorithm) organizes the accounts he follows into `modes` e.g space mode, productivity mode, technology mode, musical mode etc. These modes would serve as a subdomains for the accounts a user follows, creating structure and encouraging purposeful usage (scrolling).

#### PRIVACY SETTINGS, DATA MANAGEMENT AND TERMS AND CONDITIOINS.

- 26/9/2023
  - There are some kinda important data management rules that wembee would have to follow. Most of them are unknown to me now, but some exaples that I might consider are: GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act).
    These should be final included in final touches I would make when the final version of Wembee is a finished product.
    I can also check the existing terms and conditions on othe social sites and try to adapt from theirs.

#### GLOBAL VARIABLES

- 26/9/2023
  - Global variables are a feature that would grant users the ability to store data which they can easily re-use through the app or in a chat environment. They are the predessecors for more intimate variable features like AI memes that are generate using images a user stores and made accessible to it's usable scope.

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

### Frontend

### Backend

#### Global error handling

I must still create a global error handler for when the process is in production
