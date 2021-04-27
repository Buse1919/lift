import { BlockPublicAccess, Bucket, BucketEncryption } from "@aws-cdk/aws-s3";
import { Construct, Duration } from "@aws-cdk/core";
import { FromSchema } from "json-schema-to-ts";
import type { Serverless } from "../types/serverless";
import { Component } from "../classes/Component";

const LIFT_COMPONENT_NAME_PATTERN = "^[a-zA-Z0-9-_]+$";
const STORAGE_COMPONENT = "storage";
const STORAGE_DEFINITION = {
    type: "object",
    properties: {
        archive: { type: "number", min: 30 },
        encryption: {
            anyOf: [{ const: "s3" }, { const: "kms" }],
        },
    },
    additionalProperties: false,
} as const;
const STORAGE_DEFINITIONS = {
    type: "object",
    patternProperties: {
        [LIFT_COMPONENT_NAME_PATTERN]: STORAGE_DEFINITION,
    },
} as const;

const STORAGE_DEFAULTS: Required<FromSchema<typeof STORAGE_DEFINITION>> = {
    archive: 45,
    encryption: "s3",
};

export class Storage extends Component<typeof STORAGE_COMPONENT, typeof STORAGE_DEFINITIONS> {
    constructor(serverless: Serverless) {
        super({
            name: STORAGE_COMPONENT,
            serverless,
            schema: STORAGE_DEFINITIONS,
        });

        this.configurationVariablesSources = {
            storage: {
                resolve: this.resolve.bind(this)
            },
        };
    }

    resolve({ address }: {address: string}) {
        const configuration = this.getConfiguration();
        if (!configuration) {
            throw new Error('toto')
        }
        if ( !configuration[address] ) throw new Error('toto')
        return {
            value: "Hello",
        };
    }

    compile(): void {
        const configuration = this.getConfiguration();
        if (!configuration) {
            return;
        }
        Object.entries(configuration).map(([storageName, storageConfiguration]) => {
            new StorageConstruct(this.serverless.stack, storageName, storageConfiguration);
        });
    }
}

class StorageConstruct extends Construct {
    constructor(scope: Construct, id: string, storageConfiguration: FromSchema<typeof STORAGE_DEFINITION>) {
        super(scope, id);
        const resolvedStorageConfiguration = Object.assign(STORAGE_DEFAULTS, storageConfiguration);

        const encryptionOptions = {
            s3: BucketEncryption.S3_MANAGED,
            kms: BucketEncryption.KMS_MANAGED,
        };

        new Bucket(this, "Bucket", {
            encryption: encryptionOptions[resolvedStorageConfiguration.encryption],
            versioned: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            lifecycleRules: [
                {
                    noncurrentVersionExpiration: Duration.days(30),
                },
            ],
        });
    }
}
