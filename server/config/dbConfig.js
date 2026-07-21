import mongoose from "mongoose";

// const MAX_RETRIES = 3;
// const RETRY_INTERVAL = 5000;

// // industry level connection
// class DatabaseConnection {
//     constructor() {
//         this.retryCount = 0;
//         this.isConnected = false;

//         mongoose.set("strictQuery", true);

//         mongoose.connection.on("connected", () => {
//             console.log("MongoDB Connected Successfully");
//             this.isConnected = true;
//         });

//         mongoose.connection.on("error", (err) => {
//             console.log("MongoDB Connection Error:", err.message);
//             this.isConnected = false;
//         });

//         mongoose.connection.on("disconnected", () => {
//             console.log("MongoDB Disconnected");
//            // this.isConnected = false;
//             this.handleConnectionError()
//         });

//         process.on('SIGTERM', this.handleAppTermination.bind(this))
//     }

//     async connect() {
//         try {
//             if (!process.env.MONGO_URL) {
//                 throw new Error("MONGO_URL is not defined");
//             }

//             const connectionOptions = {
//                 maxPoolSize: 5,
//                 serverSelectionTimeoutMS: 5000,
//                 socketTimeoutMS: 45000,
//                 family: 4,
//             };

//             if (process.env.NODE_ENV === "development") {
//                 mongoose.set("debug", true);
//             }

//             await mongoose.connect(
//                 process.env.MONGO_URL,
//                 connectionOptions
//             );

//             this.retryCount = 0;
//         } catch (error) {
//             console.error("Connection Failed:", error.message);
//             await this.handleConnectionError();
//         }
//     }

//     async handleConnectionError() {
//         if (this.retryCount < MAX_RETRIES) {
//             this.retryCount++;

//             console.log(
//                 `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`
//             );

//             await new Promise((resolve) =>
//                 setTimeout(resolve, RETRY_INTERVAL)
//             );

//             return this.connect();
//         }

//         console.error(
//             `Failed to connect to DB after ${MAX_RETRIES} attempts`
//         );
//         process.exit(1);
//     }

//     async handleDisconnection(){
//         if(!this.isConnected){
//             console.log("Attempting to reconneted to mognodb...")
//             this.connect()
//         }
//     }

//     async handleAppTermination(){
//         try{
  
//             await mongoose.connection.close()
//             console.log("MongoDB connection close through app termination")
//             process.exit(0)

//         }catch(e){
//             console.error("Error during database disconnection ", error)
//             process.exit(1)

//         }
//     }

//     getConnectionStatus(){
//         return{
//             isConnected: this.isConnected,
//             readyState: mongoose.connection.readyState,
//             host: mongoose.connection.host,
//             name: mongoose.connection.name
//         }
//     }

// }


// const dbConnection = new DatabaseConnection()

// export default dbConnection.connect.bind(dbConnection )
// export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)




const MONGO_URL = process.env.MONGO_URL

const connectDb =  ()=>{
   try{ 
       mongoose.connect(MONGO_URL)
      .then((conn) => {
         console.log(`db is connect ${conn.connection.host}`)
        })
      .catch((e) => {
           console.log('error while connecting to db ', e)
        })

    }catch(e){
          console.log('error while connecting to db ', e)
          process.exit(1)
    }

}


export default connectDb  