declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    interface Process {
      env: ProcessEnv;
    }
  }
  const process: NodeJS.Process;
}

export {};
