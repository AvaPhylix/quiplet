export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  theme_color: string;
  created_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  child_id: string;
  quote_text: string;
  context: string | null;
  said_at: string;
  location: string | null;
  emoji: string | null;
  bg_gradient: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  children?: Child;
  tags?: Tag[];
  quote_tags?: QuoteTag[];
  attachments?: Attachment[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export interface QuoteTag {
  quote_id: string;
  tag_id: string;
  tags?: Tag;
}

export interface Attachment {
  id: string;
  quote_id: string;
  type: 'image' | 'audio';
  storage_path: string;
  file_name: string;
  mime_type: string;
}

export interface FamilyInvite {
  id: string;
  inviter_id: string;
  email: string;
  role: string;
  status: string;
}

export interface FamilyMember {
  id: string;
  family_owner_id: string;
  member_id: string;
  role: string;
}
