const Config = {
  minAge: 7,
  maxAge: 150,
  // maxChatImages: 20,
  maxChatImages: 5, // Test users usecase of this number
  reCaptchaKey: '6LeEx4EnAAAAABjh7VHeMAe9_0K8sLe5oKndw4dU',
  homeRoute: '/',
  userRoute: '/api/v1/users',
  suggestionRoute: '/api/v1/suggest',
  followRoute: '/api/v1/follow',
  contactRoute: '/api/v1/contacts',
  chatRoute: '/api/v1/chat',
  engagementScores: {
    follow: 6,
  },
};

export default Config;
