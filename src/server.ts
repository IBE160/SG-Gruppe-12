import app from './app';
import './jobs/cv-parsing.job'; // Import the job processor to start it

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});