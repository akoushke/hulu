export type Branding = {
  id: string;
  name: string;
  logo: string;
} | null;

export type View = {
  id: string;
  actionText: string;
  description: string;
  title: string;
  horizontalImage: string;
  verticalImage: string;
  branding: Branding;
  rating: string;
  genre: string[];
  type: "series" | "movie" | "episode";
  date: Date;
};

export type Collection = {
  id: string;
  title: string;
  href: string;
  theme: string;
  views?: View[];
};
