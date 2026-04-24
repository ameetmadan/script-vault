export type SavedScript = {
  id: string;
  name: string;
  urlPattern: string;
  code: string;
  createdAt: number;
  updatedAt: number;
};

export type RunScriptResult = {
  ok: boolean;
  message: string;
  matchedUrl?: string;
};

export type BackgroundRequest =
  | { type: "run-script"; scriptId: string }
  | { type: "get-active-tab-url" };

export type BackgroundResponse =
  | RunScriptResult
  | {
      ok: boolean;
      url?: string;
      message?: string;
    };
