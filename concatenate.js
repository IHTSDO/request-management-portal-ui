const fs = require('fs-extra');

concatenate = async () =>{
    await fs.ensureDir('dist/request-management-portal-ui');
    await fs.copy('./src/dashboard/', 'dist/request-management-portal-ui/dashboard/');
}
concatenate();
