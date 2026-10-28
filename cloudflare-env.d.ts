declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    GEMINI_API_KEY?: string;
    GOOGLE_DRIVE_CLIENT_ID?: string;
    GOOGLE_DRIVE_CLIENT_SECRET?: string;
    GOOGLE_DRIVE_ENCRYPTION_KEY?: string;
    BUCKET?: R2Bucket;
    BOARD_LOGIN_HASH?: string;
    BOARD_LOGIN_SALT?: string;
  }
}
