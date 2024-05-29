export type GoogleFile = {
    kind: string;
    driveId: string | undefined; // undefined if in the user's My Drive
    fileExtension: string;
    copyRequiresWriterPermission?: boolean;
    md5Checksum?: string;
    contentHints?: {
        indexableText: string;
        thumbnail: {
            image: string;
            mimeType: string;
        };
    };
    writersCanShare?: boolean;
    viewedByMe?: boolean;
    mimeType: string;
    exportLinks?: {
        [key: string]: string;
    };
    parents?: [string];
    thumbnailLink: string;
    iconLink: string;
    shared?: boolean;
    lastModifyingUser?: {
        object(User);
    };
    owners?: [
        {
            object(User);
        }
    ];
    headRevisionId?: string;
    sharingUser?: {
        object(User);
    };
    webViewLink: string;
    webContentLink?: string;
    size?: string;
    viewersCanCopyContent?: boolean;
    permissions?: [
        {
            object(Permission);
        }
    ];
    hasThumbnail: boolean;
    spaces?: [string];
    folderColorRgb?: string;
    id: string;
    name: string;
    description?: string;
    starred?: boolean;
    trashed?: boolean;
    explicitlyTrashed?: boolean;
    createdTime?: string;
    modifiedTime?: string;
    modifiedByMeTime?: string;
    viewedByMeTime?: string;
    sharedWithMeTime?: string;
    quotaBytesUsed?: string;
    version?: string;
    originalFilename?: string;
    ownedByMe?: boolean;
    fullFileExtension?: string;
    properties?: {
        [key: string]: unknown;
    };
    appProperties?: {
        [key: string]: unknown;
    };
    isAppAuthorized?: boolean;
    teamDriveId?: string;
    capabilities?: {
        canChangeViewersCanCopyContent: boolean;
        canMoveChildrenOutOfDrive: boolean;
        canReadDrive: boolean;
        canEdit: boolean;
        canCopy: boolean;
        canComment: boolean;
        canAddChildren: boolean;
        canDelete: boolean;
        canDownload: boolean;
        canListChildren: boolean;
        canRemoveChildren: boolean;
        canRename: boolean;
        canTrash: boolean;
        canReadRevisions: boolean;
        canReadTeamDrive: boolean;
        canMoveTeamDriveItem: boolean;
        canChangeCopyRequiresWriterPermission: boolean;
        canMoveItemIntoTeamDrive: boolean;
        canUntrash: boolean;
        canModifyContent: boolean;
        canMoveItemWithinTeamDrive: boolean;
        canMoveItemOutOfTeamDrive: boolean;
        canDeleteChildren: boolean;
        canMoveChildrenOutOfTeamDrive: boolean;
        canMoveChildrenWithinTeamDrive: boolean;
        canTrashChildren: boolean;
        canMoveItemOutOfDrive: boolean;
        canAddMyDriveParent: boolean;
        canRemoveMyDriveParent: boolean;
        canMoveItemWithinDrive: boolean;
        canShare: boolean;
        canMoveChildrenWithinDrive: boolean;
        canModifyContentRestriction: boolean;
        canAddFolderFromAnotherDrive: boolean;
        canChangeSecurityUpdateEnabled: boolean;
        canAcceptOwnership: boolean;
        canReadLabels: boolean;
        canModifyLabels: boolean;
        canModifyEditorContentRestriction: boolean;
        canModifyOwnerContentRestriction: boolean;
        canRemoveContentRestriction: boolean;
    };
    hasAugmentedPermissions?: boolean;
    trashingUser?: {
        object(User);
    };
    thumbnailVersion?: string;
    trashedTime?: string;
    modifiedByMe?: boolean;
    permissionIds?: [string];
    imageMediaMetadata?: {
        flashUsed: boolean;
        meteringMode: string;
        sensor: string;
        exposureMode: string;
        colorSpace: string;
        whiteBalance: string;
        width: integer;
        height: integer;
        location: {
            latitude: number;
            longitude: number;
            altitude: number;
        };
        rotation: integer;
        time: string;
        cameraMake: string;
        cameraModel: string;
        exposureTime: number;
        aperture: number;
        focalLength: number;
        isoSpeed: integer;
        exposureBias: number;
        maxApertureValue: number;
        subjectDistance: integer;
        lens: string;
    };
    videoMediaMetadata?: {
        width: integer;
        height: integer;
        durationMillis: string;
    };
    shortcutDetails?: {
        targetId: string;
        targetMimeType: string;
        targetResourceKey: string;
    };
    contentRestrictions?: [
        {
            object(ContentRestriction);
        }
    ];
    resourceKey?: string;
    linkShareMetadata?: {
        securityUpdateEligible: boolean;
        securityUpdateEnabled: boolean;
    };
    labelInfo?: {
        labels: [
            {
                object(Label);
            }
        ];
    };
    sha1Checksum?: string;
    sha256Checksum?: string;
};

export type GoogleFileModifier = {
    [key in keyof GoogleFile]?: GoogleFile[key];
}

export type GoogleDrive = {
    id: string,
    name: string,
    colorRgb: string,
    kind?: string,
    backgroundImageLink?: string,
    capabilities?: {
      canAddChildren: boolean,
      canComment: boolean,
      canCopy: boolean,
      canDeleteDrive: boolean,
      canDownload: boolean,
      canEdit: boolean,
      canListChildren: boolean,
      canManageMembers: boolean,
      canReadRevisions: boolean,
      canRename: boolean,
      canRenameDrive: boolean,
      canChangeDriveBackground: boolean,
      canShare: boolean,
      canChangeCopyRequiresWriterPermissionRestriction: boolean,
      canChangeDomainUsersOnlyRestriction: boolean,
      canChangeDriveMembersOnlyRestriction: boolean,
      canChangeSharingFoldersRequiresOrganizerPermissionRestriction: boolean,
      canResetDriveRestrictions: boolean,
      canDeleteChildren: boolean,
      canTrashChildren: boolean
    },
    themeId?: string,
    backgroundImageFile?: {
      id: string,
      xCoordinate: number,
      yCoordinate: number,
      width: number
    },
    createdTime?: string,
    hidden?: boolean,
    restrictions?: {
      copyRequiresWriterPermission: boolean,
      domainUsersOnly: boolean,
      driveMembersOnly: boolean,
      adminManagedRestrictions: boolean,
      sharingFoldersRequiresOrganizerPermission: boolean
    },
    orgUnitId?: string
  }

  export type FileGetQuery = {
    supportsAllDrives?: boolean;
    alt?: "" | "media" | "proto" | "json";
};

export type FileListQuery = {
    corpora?: user | domain | drive | allDrives;
    driveId?: string;
    includeItemsFromAllDrives?: boolean;
    orderBy?:
        | createdTime
        | folder
        | modifiedByMeTime
        | modifiedTime
        | name
        | quotaBytesUsed
        | recency
        | sharedWithMeTime
        | starred
        | viewedByMeTime;
    pageSize?: number;
    pageToken?: string;
    q?: string;
    spaces?: (drive | appDataFolder)[];
    supportsAllDrives?: boolean;
    includePermissionsForView?: string;
    includeLabels?: string;
    fields?: string;
};

export type FileListResponse = {
    nextPageToken: string;
    kind: string;
    incompleteSearch: boolean;
    files: GoogleFile[];
};

export type FileUpdateQuery = {
    uploadType?: media | multipart | resumable;
    ignoreDefaultVisibility?: boolean;
    keepRevisionForever?: boolean;
    ocrLanguage?: string;
    supportsAllDrives?: boolean;
    useContentAsIndexableText?: boolean;
    includePermissionsForView?: string;
    includeLabels?: string;
}

export type FileCreateQuery = {
    uploadType?: media | multipart | resumable;
    ignoreDefaultVisibility?: boolean;
    keepRevisionForever?: boolean;
    ocrLanguage?: string;
    supportsAllDrives?: boolean;
    useContentAsIndexableText?: boolean;
    includePermissionsForView?: string;
    includeLabels?: string;
}

export type FileGenerateIdQuery = {
    count: number;
    space: "drive" | "appDataFolder";
    type: "files" | "shortcuts";
}

export type FileGenerateIdResponse = {
    "ids": [
        string
    ],
    "space": string,
    "kind": "drive#generatedIds",
}

export type FileDeleteQuery = {
    supportsAllDrives?: boolean;
}

export type DriveListQuery = {
    pageSize?: number;
    pageToken?: string;
    q?: string;
    useDomainAdminAccess?: boolean;
}

export type DriveListResponse = {
    nextPageToken: string;
    kind: string;
    drives: GoogleDrive[];
}