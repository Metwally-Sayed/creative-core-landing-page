export type StudioLocation = {
  city: string;
  address: string[];
  email: string;
  href: string;
};

export const studioLocations: StudioLocation[] = [
  {
    city: "New York",
    address: [
      "36 East 20th St, 6th Floor",
      "New York, NY 10003",
      "Tel: +1 917 818-4282",
    ],
    email: "hello@hellomonday.com",
    href: "https://www.google.com/maps/place/Hello+Monday/@40.7385487,-73.9908801,17z",
  },
  {
    city: "Copenhagen",
    address: [
      "Langebrogade 6E, 2nd floor",
      "1411 Copenhagen",
      "Tel: +45 3145 6035",
    ],
    email: "hello@hellomonday.com",
    href: "https://www.google.com/maps/place/Hello+Monday/@55.6658995,12.5783361,17z",
  },
  {
    city: "Aarhus",
    address: [
      "Banegardspladsen 20A, 1.TV",
      "8000 Aarhus C",
      "Tel: +45 6015 4515",
    ],
    email: "hello@hellomonday.com",
    href: "https://www.google.com/maps/place/Hello+Monday/@56.1500968,10.2030539,17z",
  },
  {
    city: "Amsterdam",
    address: [
      "Generaal Vetterstraat 66",
      "1059 BW Amsterdam",
      "Netherlands",
    ],
    email: "hello@hellomonday.com",
    href: "https://www.google.com/maps/place/Generaal+Vetterstraat+66,+1059+BW+Amsterdam,+Netherlands",
  },
];
