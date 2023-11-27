const User = require('../models/user/userModel');
const Interest = require('../models/interest/interestModel');
const Follow = require('../models/follow/followModel');
// const Contact = require('../models/contact/contactsModel');
// const Chat = require('../models/chat/chatModel');
const interestConfig = require('../config/interestConfig');
const countryRegions = require('../config/countryRegions.json');

class ReUse {
  constructor() {
    // TAKE EXTRA CARE BEFORE CALLING A METHOD
    this.delayTime = 1000 * 10;
    // this.CREATE_USERS(10000, 10);
    // this.CREATE_FOLLOWS(30000);
    // this.DELETE_USERS();
    // this.DELETE_FOLLOWS();
    // this.DELETE_AND_PREPARE_FOR_CONTACT();
  }

  CREATE_USERS(delay, numberOfDummies) {
    setTimeout(async () => {
      const countries = interestConfig.exampleCountries;
      countries.forEach((country) => {
        const region = countryRegions.find((region) => {
          return region.country === country.country.toLowerCase();
        });
        country.region = region?.region || 'global';
      });

      const contentType = () => {
        const types = [
          {
            topic: 'comic artists',
            interest: 'animation and comics',
            engagements: Math.floor(Math.random() * 10),
          },
          {
            topic: 'camping',
            interest: 'outdoors',
            engagements: Math.floor(Math.random() * 10),
          },
          {
            topic: 'astronomy',
            interest: 'science',
            engagements: Math.floor(Math.random() * 10),
          },
          {
            topic: 'movies',
            interest: 'entertainment',
            engagements: Math.floor(Math.random() * 10),
          },
          {
            topic: 'software',
            interest: 'technology',
            engagements: Math.floor(Math.random() * 10),
          },
        ];
        const selected = [];
        types.forEach((content) =>
          Math.round(Math.random()) ? selected.push(content) : ''
        );
        return selected;
      };
      const dummy = {
        number: numberOfDummies || 10,
        name: 'volunteer',
        frontEndUsername: 'VolunteeR',
        dateOfBirth: '2003-07-06',
        password: '#1234567eR',
        dummyEmailExtension: '@wm.com',
      };
      for (let i = 0; i < dummy.number; i++) {
        const currentDummy = `${dummy.frontEndUsername}${i + 1}`;
        const created = await User.create({
          name: dummy.name,
          frontEndUsername: currentDummy,
          username: currentDummy,
          email: currentDummy + dummy.dummyEmailExtension,
          password: dummy.password,
          passwordConfirm: dummy.password,
          dateOfBirth: dummy.dateOfBirth,
          contentType: contentType(),
          IPGeoLocation:
            countries[Math.round(Math.random() * (countries.length - 1))],
        });
      }
      console.log(`CREATED ${dummy.number} Volunteers`);
    }, delay || this.delayTime);
  }

  CREATE_FOLLOWS(delay) {
    setTimeout(async () => {
      const allUsers = await User.find();
      const promises = allUsers.map(async (user, i) => {
        const randNum = Math.floor(Math.random() * allUsers.length);
        let following = allUsers[randNum]._id;
        const follower = user._id;
        following =
          following !== follower
            ? following
            : allUsers[randNum + 1]?._id || allUsers[randNum - 1]?._id;
        const createFollow = await Follow.create({ follower, following });
        await User.findByIdAndUpdate(
          { _id: follower },
          { $inc: { numberOfFollowing: 1 } }
        );
        await User.findByIdAndUpdate(
          { _id: following },
          { $inc: { numberOfFollowers: 1 } }
        );
      });
      await Promise.all(promises);
      console.log(`FOLLOWED ${allUsers.length} Volunteers`);
    }, delay || this.delayTime);
  }

  DELETE_USERS(delay) {
    setTimeout(async () => {
      const deleted = await User.deleteMany();
      console.log(`Deleted: ${deleted.deletedCount} Volunteers`);
    }, delay || this.delayTime);
  }

  DELETE_FOLLOWS(delay) {
    setTimeout(async () => {
      const deleted = await Follow.deleteMany();
      console.log(`Deleted: ${deleted.deletedCount} Follows`);
    }, delay || this.delayTime);
  }

  // ⚠⚠ USE WITH CAUTION.
  // DELETE_AND_PREPARE_FOR_CONTACT(delay = 5000) {
  //   setTimeout(async () => {
  //     const deletedContacts = await Contact.deleteMany();
  //     const deletedChats = await Chat.deleteMany();
  //     const { nModified } = await User.updateMany(
  //       {},
  //       {
  //         contactRequest: {
  //           accepted: 0,
  //           unViewed: 0,
  //           received: 0,
  //           sent: 0,
  //         },
  //       }
  //     );
  //     console.log(
  //       `Deleted: ${deletedContacts.deletedCount} contacts, ${deletedChats.deletedCount} chats and updated ${nModified} users`
  //     );
  //   }, delay || this.delayTime);
  // }

  CREATE_INTERESTS(delay) {
    setTimeout(async () => {
      const interestToCreate = [
        { topic: 'Comic Artists', interest: 'Animation and Comics' },
        { topic: 'Camping', interest: 'Outdoors' },
        { topic: 'Astronomy', interest: 'Science' },
        { topic: 'Movies', interest: 'Entertainment' },
        { topic: 'Software', interest: 'Technology' },
        { topic: 'Freelancing', interest: 'Careers' },
        { topic: 'Parenting Tips', interest: 'Family and Relationships' },
        { topic: 'Fitness Trends', interest: 'Fitness' },
        { topic: 'Workplace Tips', interest: 'Careers' },
        { topic: 'Video Games', interest: 'Gaming' },
        { topic: 'Recipes', interest: 'Food' },
        { topic: 'Cultural Experiences', interest: 'Travel' },
        { topic: 'Tech News', interest: 'Technology' },
        { topic: 'Gaming Consoles', interest: 'Gaming' },
        { topic: 'Food Reviews', interest: 'Food' },
        { topic: 'Baseball', interest: 'Sports' },
        { topic: 'Family Activities', interest: 'Family and Relationships' },
        { topic: 'Game Reviews', interest: 'Gaming' },
        { topic: 'Literature', interest: 'Arts and Culture' },
        { topic: 'Football (Soccer)', interest: 'Sports' },
        { topic: 'Food Trends', interest: 'Food' },
        { topic: 'Wildlife', interest: 'Outdoors' },
        { topic: 'Beauty Products', interest: 'Fashion and Beauty' },
        { topic: 'Restaurant Reviews', interest: 'Food' },
        { topic: 'Fashion Trends', interest: 'Fashion and Beauty' },
        { topic: 'Award Shows', interest: 'Entertainment' },
        { topic: 'Cultural Events', interest: 'Arts and Culture' },
        { topic: 'Fitness Equipment', interest: 'Fitness' },
        { topic: 'Theater', interest: 'Entertainment' },
        { topic: 'Adventure Travel', interest: 'Travel' },
        { topic: 'Travel Adventures', interest: 'Travel' },
        { topic: 'Parenting', interest: 'Family and Relationships' },
        { topic: 'Comic Books', interest: 'Animation and Comics' },
        { topic: 'Visual Arts', interest: 'Arts and Culture' },
        { topic: 'Artificial Intelligence', interest: 'Technology' },
        { topic: 'Destinations', interest: 'Travel' },
        { topic: 'Nature Exploration', interest: 'Outdoors' },
        { topic: 'Outdoor Gear', interest: 'Outdoors' },
        { topic: 'Hiking', interest: 'Outdoors' },
        { topic: 'Cooking', interest: 'Food' },
        { topic: 'Scientific Discoveries', interest: 'Science' },
        { topic: 'Golf', interest: 'Sports' },
        { topic: 'Professional Growth', interest: 'Careers' },
        { topic: 'Virtual Reality', interest: 'Technology' },
        { topic: 'Beauty Tips', interest: 'Fashion and Beauty' },
        { topic: 'Gaming Communities', interest: 'Gaming' },
        { topic: 'Cricket', interest: 'Sports' },
        { topic: 'Personal Finance', interest: 'Business and Finance' },
        { topic: 'Environment', interest: 'Science' },
        { topic: 'Entrepreneurship', interest: 'Business and Finance' },
        { topic: 'Education', interest: 'Science' },
        { topic: 'Job Search', interest: 'Careers' },
        { topic: 'Job Interviews', interest: 'Careers' },
        { topic: 'Research Breakthroughs', interest: 'Science' },
        { topic: 'Rugby', interest: 'Sports' },
        { topic: 'Comic Conventions', interest: 'Animation and Comics' },
        { topic: 'Cryptocurrency', interest: 'Business and Finance' },
        { topic: 'Music Production', interest: 'Music' },
        { topic: 'Backpacking', interest: 'Travel' },
        { topic: 'Business Trends', interest: 'Business and Finance' },
        { topic: 'Animation Techniques', interest: 'Animation and Comics' },
        { topic: 'American Football', interest: 'Sports' },
        { topic: 'Marriage', interest: 'Family and Relationships' },
        { topic: 'Basketball', interest: 'Sports' },
        { topic: 'Culinary Techniques', interest: 'Food' },
        { topic: 'Workouts', interest: 'Fitness' },
        { topic: 'Performing Arts', interest: 'Arts and Culture' },
        { topic: 'Formula 1', interest: 'Sports' },
        { topic: 'Startups', interest: 'Business and Finance' },
        { topic: 'Smartphones', interest: 'Technology' },
        { topic: 'Cultural Heritage', interest: 'Arts and Culture' },
        { topic: 'Travel Tips', interest: 'Travel' },
        { topic: 'Music Festivals', interest: 'Music' },
        { topic: 'History', interest: 'Science' },
        { topic: 'eSports', interest: 'Sports' },
        { topic: 'Psychology', interest: 'Science' },
        { topic: 'Music Artists', interest: 'Music' },
        { topic: 'Fitness Challenges', interest: 'Fitness' },
        { topic: 'Makeup', interest: 'Fashion and Beauty' },
        { topic: 'TV Shows', interest: 'Entertainment' },
        { topic: 'Mathematics', interest: 'Science' },
        { topic: 'Music Reviews', interest: 'Music' },
        { topic: 'Family Health', interest: 'Family and Relationships' },
        { topic: 'Gadgets', interest: 'Technology' },
        { topic: 'Fashion Shows', interest: 'Fashion and Beauty' },
        { topic: 'Gaming News', interest: 'Gaming' },
        { topic: 'Career Development', interest: 'Careers' },
        { topic: 'Animation Studios', interest: 'Animation and Comics' },
        { topic: 'Tennis', interest: 'Sports' },
        { topic: 'Art History', interest: 'Arts and Culture' },
        { topic: 'Animation Films', interest: 'Animation and Comics' },
        { topic: 'Fitness Nutrition', interest: 'Fitness' },
        { topic: 'Relationship Advice', interest: 'Family and Relationships' },
        { topic: 'Celebrities', interest: 'Entertainment' },
        { topic: 'Stock Market', interest: 'Business and Finance' },
        { topic: 'Music History', interest: 'Music' },
        { topic: 'Fashion Designers', interest: 'Fashion and Beauty' },
        { topic: 'Exercise Routines', interest: 'Fitness' },
        { topic: 'Outdoor Activities', interest: 'Outdoors' },
        { topic: 'Music Genres', interest: 'Music' },
      ];
      const promises = interestToCreate.map(async (interest, i) => {
        interest.regions = interestConfig.DEFAULT_REGIONS();
        await Interest.create(interest);
      });
      await Promise.all(promises);
      console.log('INTERESTs CREATED');
    }, delay || this.delayTime);
  }

  DELETE_INTERESTS(delay) {
    setTimeout(async () => {
      const deleted = await Interest.deleteMany();
      console.log(`Deleted: ${deleted.deletedCount} Interests`);
    }, delay || this.delayTime);
  }
}

module.exports = new ReUse();
