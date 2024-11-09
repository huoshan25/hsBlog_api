export class UpdateProfileDto {
  name: string;
  title: string;
  description: string;
  bio: string[];
  skills: {
    name: string;
    items: { name: string }[];
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    link: string;
  }[];
  contacts: {
    platform: string;
    link: string;
    icon: string;
  }[];
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogDescription: string;
    twitterDescription: string;
  };
}