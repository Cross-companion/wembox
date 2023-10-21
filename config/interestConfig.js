class InterestConfig {
  constructor() {
    this.exampleCountries = [
      {
        country: 'Nigeria',
        city: 'Lagos',
        continent: 'Africa',
      },
      {
        country: 'Egypt',
        city: 'Cairo',
        continent: 'Africa',
      },
      {
        country: 'South Africa',
        city: 'Johannesburg',
        continent: 'Africa',
      },
      {
        country: 'Ghana',
        city: 'Accra',
        continent: 'Africa',
      },
      {
        country: 'Nigeria',
        city: 'Lagos',
        continent: 'Africa',
      },
      {
        country: 'Nigeria',
        city: 'Lagos',
        continent: 'Africa',
      },
      {
        country: 'United Kingdom',
        city: 'London',
        continent: 'Europe',
      },
      {
        country: 'France',
        city: 'Paris',
        continent: 'Europe',
      },
      {
        country: 'China',
        city: 'Beijing',
        continent: 'Asia',
      },
      {
        country: 'United States',
        city: 'Washington, D.C.',
        continent: 'North America',
      },
      {
        country: 'United States',
        city: 'Washington, D.C.',
        continent: 'North America',
      },
      {
        country: 'Russia',
        city: 'Moscow',
        continent: 'Europe',
      },
      {
        country: 'South Korea',
        city: 'Seoul',
        continent: 'Asia',
      },
    ];
    // this.exampleCountries = [
    //   {
    //     country: 'Nigeria',
    //     city: 'Lagos',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Egypt',
    //     city: 'Cairo',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Egypt',
    //     city: 'Cairo',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'South Africa',
    //     city: 'Johannesburg',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'South Africa',
    //     city: 'Johannesburg',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'South Africa',
    //     city: 'Johannesburg',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Kenya',
    //     city: 'Nairobi',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Uganda',
    //     city: 'Kampala',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Morocco',
    //     city: 'Rabat',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Ghana',
    //     city: 'Accra',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Ghana',
    //     city: 'Accra',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Madagascar',
    //     city: 'Antananarivo',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Niger',
    //     city: 'Niamey',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Burkina Faso',
    //     city: 'Ouagadougou',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'United Kingdom',
    //     city: 'London',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'France',
    //     city: 'Paris',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'China',
    //     city: 'Beijing',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'China',
    //     city: 'Beijing',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'China',
    //     city: 'Beijing',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'United States',
    //     city: 'Washington, D.C.',
    //     continent: 'North America',
    //   },
    //   {
    //     country: 'India',
    //     city: 'New Delhi',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'United States',
    //     city: 'Washington, D.C.',
    //     continent: 'North America',
    //   },
    //   {
    //     country: 'United States',
    //     city: 'Washington, D.C.',
    //     continent: 'North America',
    //   },
    //   {
    //     country: 'United States',
    //     city: 'Washington, D.C.',
    //     continent: 'North America',
    //   },
    //   {
    //     country: 'Indonesia',
    //     city: 'Jakarta',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'Pakistan',
    //     city: 'Islamabad',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'Brazil',
    //     city: 'Brasília',
    //     continent: 'South America',
    //   },
    //   {
    //     country: 'Nigeria',
    //     city: 'Abuja',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Nigeria',
    //     city: 'Abuja',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Nigeria',
    //     city: 'Abuja',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Russia',
    //     city: 'Moscow',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'Russia',
    //     city: 'Moscow',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'Mexico',
    //     city: 'Mexico City',
    //     continent: 'North America',
    //   },
    //   {
    //     country: 'Japan',
    //     city: 'Tokyo',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'Egypt',
    //     city: 'Cairo',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'DR Congo',
    //     city: 'Kinshasa',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Germany',
    //     city: 'Berlin',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'Thailand',
    //     city: 'Bangkok',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'United Kingdom',
    //     city: 'London',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'France',
    //     city: 'Paris',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'Italy',
    //     city: 'Rome',
    //     continent: 'Europe',
    //   },
    //   {
    //     country: 'Tanzania',
    //     city: 'Dodoma',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'South Africa',
    //     city: 'Pretoria',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'Myanmar',
    //     city: 'Naypyidaw',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'Kenya',
    //     city: 'Nairobi',
    //     continent: 'Africa',
    //   },
    //   {
    //     country: 'South Korea',
    //     city: 'Seoul',
    //     continent: 'Asia',
    //   },
    //   {
    //     country: 'Colombia',
    //     city: 'Bogotá',
    //     continent: 'South America',
    //   },
    // ];
  }
}

module.exports = new InterestConfig();
