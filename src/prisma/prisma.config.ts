import { defineConfig } from '@prisma/config';

import { ENVS } from '@config/envs';


export default defineConfig({
    datasource: {
        url: ENVS.DATABASE_URL,
    },
});
