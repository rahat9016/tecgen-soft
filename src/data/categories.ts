export interface Category {
  name: string;
  icon:
    | "mobile"
    | "headphones"
    | "fashion"
    | "kitchen"
    | "beauty"
    | "sports"
    | "books"
    | "toys"
    | "grocery"
    | "automobile";
}

export const categories: Category[] = [
  { name: "Mobile & Accessories", icon: "mobile" },
  { name: "Electronics", icon: "headphones" },
  { name: "Fashion", icon: "fashion" },
  { name: "Home & Kitchen", icon: "kitchen" },
  { name: "Beauty & Health", icon: "beauty" },
  { name: "Sports", icon: "sports" },
  { name: "Books & Stationery", icon: "books" },
  { name: "Toys & Games", icon: "toys" },
  { name: "Grocery", icon: "grocery" },
  { name: "Automobile", icon: "automobile" },
];
