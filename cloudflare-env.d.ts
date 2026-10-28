declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    BOARD_LOGIN_HASH?: string;
    BOARD_LOGIN_SALT?: string;
  }
}
