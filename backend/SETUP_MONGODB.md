# MongoDB Atlas Setup

## Connection String

Your MongoDB Atlas connection string has been configured:

```
mongodb+srv://teamadarshdabral_db_user:%3CprojectTest%3E@cluster0.scucbje.mongodb.net/staayzy?appName=Cluster0
```

## Important Notes

1. **Username**: `teamadarshdabral_db_user` (fixed from the original typo)
2. **Password**: `<projectTest>` - This has been URL-encoded as `%3CprojectTest%3E` in the connection string
3. **Database**: `staayzy` - This will be created automatically when you first connect
4. **Cluster**: `cluster0.scucbje.mongodb.net`

## Creating the .env File

Create a `.env` file in the `backend/` directory with the following content:

```env
PORT=5001
MONGODB_URI=mongodb+srv://teamadarshdabral_db_user:%3CprojectTest%3E@cluster0.scucbje.mongodb.net/staayzy?appName=Cluster0
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRE=7d

ADMIN_EMAIL=admin@staayzy.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
ADMIN_PHONE=1234567890

# Replace the placeholders below with values from your Cloudinary account
CLOUDINARY_CLOUD_NAME=<CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<CLOUDINARY_API_SECRET>
```

## Password Encoding

The password `<projectTest>` contains special characters (`<` and `>`) which need to be URL-encoded:
- `<` = `%3C`
- `>` = `%3E`

So the password in the connection string becomes: `%3CprojectTest%3E`

## Testing the Connection

After creating the `.env` file, you can test the connection by:

1. Starting the server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see: `MongoDB connected successfully`

3. Or test with the seed script:
   ```bash
   npm run seed
   ```

## Troubleshooting

If you encounter connection errors:

1. **Check Network Access**: Ensure your IP address is whitelisted in MongoDB Atlas
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or use `0.0.0.0/0` for development (NOT recommended for production)

2. **Check Database User**: Verify the database user exists and has the correct permissions
   - Go to MongoDB Atlas → Database Access
   - Ensure the user has read/write permissions

3. **Check Connection String**: Make sure there are no extra spaces or characters in the connection string

4. **URL Encoding**: If connection fails, try without URL encoding first:
   ```
   mongodb+srv://teamadarshdabral_db_user:<projectTest>@cluster0.scucbje.mongodb.net/staayzy?appName=Cluster0
   ```
   Note: Some MongoDB drivers handle encoding automatically, but others require manual encoding.


