import { Pool } from 'pg';

// Function to generate random integer within a range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// Define constant image URL
const imageUrl: string =
  'https://images.pexels.com/photos/858115/pexels-photo-858115.jpeg';

// Interface for row data
interface DataRow {
  ID: number;
  Name: string;
  Age: number;
  Gender: string;
  Email: string;
  Phone_Number: string;
  Address: string;
  City: string;
  State: string;
  Zip_Code: string;
  Country: string;
  Occupation: string;
  Department: string;
  Salary: number;
  Date_of_Hire: Date;
  Manager: string;
  Employee_Type: string;
  Education_Level: string;
  Certification: string;
  Project_Name: string;
  Task_Description: string;
  Deadline: Date;
  Status: string;
  Priority: string;
  Image: string;
  Rating: number;
  _row_view456asd6y7da: number;
}

// Initialize an array to store the data
const data: DataRow[] = [];

// Generate 1000 rows of random data
for (let i = 0; i < 1000; i++) {
  const row: DataRow = {
    ID: i + 1,
    Name: `Person ${i + 1}`,
    Age: randomInt(18, 70),
    Gender: Math.random() < 0.5 ? 'Male' : 'Female',
    Email: `person${i + 1}@example.com`,
    Phone_Number: '123-456-7890',
    Address: '123 Main St',
    City: 'City',
    State: 'State',
    Zip_Code: '12345',
    Country: 'Country',
    Occupation: 'Occupation',
    Department: 'Department',
    Salary: Math.random() * 100000,
    Date_of_Hire: randomDate(new Date(2000, 0, 1), new Date()),
    Manager: 'Manager',
    Employee_Type: 'Employee Type',
    Education_Level: 'Education Level',
    Certification: 'Certification',
    Project_Name: `Project ${i + 1}`,
    Task_Description: 'Task Description',
    Deadline: randomDate(new Date(), new Date(2024, 11, 31)),
    Status: 'Status',
    Priority: 'Priority',
    Image: imageUrl,
    Rating: randomInt(1, 5),
    _row_view456asd6y7da: i + 1,
  };
  data.push(row);
}

// Configure PostgreSQL connection
const pool = new Pool({
  user: 'instinct',
  host: 'localhost',
  database: 'sheet',
  password: 'emamiadmin',
  port: 5432,
});

// Function to insert data into database
async function insertData() {
  const client = await pool.connect();

  const query = `
  SELECT * FROM "vedant"."vedant_new_table";
`;

  const ans = await client.query(query);

  console.log('ans::---', ans);
  try {
    for (const item of data) {
      await client.query(
        `
        INSERT INTO vedant.vedant_new_table (ID, Name, Age, Gender, Email, Phone_Number, Address, City, State, Zip_Code, Country, Occupation, Department, Salary, Date_of_Hire, Manager, Employee_Type, Education_Level, Certification, Project_Name, Task_Description, Deadline, Status, Priority, Image, Rating, _row_view456asd6y7da)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      `,
        [
          item.ID,
          item.Name,
          item.Age,
          item.Gender,
          item.Email,
          item.Phone_Number,
          item.Address,
          item.City,
          item.State,
          item.Zip_Code,
          item.Country,
          item.Occupation,
          item.Department,
          item.Salary,
          item.Date_of_Hire,
          item.Manager,
          item.Employee_Type,
          item.Education_Level,
          item.Certification,
          item.Project_Name,
          item.Task_Description,
          item.Deadline,
          item.Status,
          item.Priority,
          item.Image,
          item.Rating,
          item._row_view456asd6y7da,
        ],
      );
    }
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    console.log('inside finally');
    client.release();
    await pool.end();
  }
}

// Call the function to insert data into the database
insertData();
