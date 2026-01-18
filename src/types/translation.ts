export interface Word {
  source: string;
  target: string;
}

export interface Translation {
  id: string;
  category: string;
  source: {
    language: string;
    sentence: string;
  };
  target: {
    language: string;
    sentence: string;
  };
  words: Word[];
}

export interface Category {
  id: string;
  name: string;
  nameRu: string;
  icon: string;
}

export interface TranslationData {
  categories: Category[];
  translations: Translation[];
}
