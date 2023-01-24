export class Configuration {
    version: string;
    jiraUrl: string;
    terminologyServerEndpoint: string;
    extensions: Extension[];
    languages: Language[];
}

export class Extension {
    code: string;
    extensionFlag: string;
    extensionName: string;
    defaultLanguage: string;
    projectKey: string;
    contactUsUrl: string;
    userGuideUrl: string;
}

export class Language {
    languageCode: string;
    languageFlag: string;
    languageName: string;
}
