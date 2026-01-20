require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Old processes to clean up
const oldProcessNames = [
  'Deep Work Session',
  'Exercise',
  'Reading',
  'Meeting',
  'Learning',
];

const exampleProcesses = [
  {
    name: 'Market Visit Deck',
    description: 'Track time building market visit decks - pulling reports and using multiple tools',
    is_official: true,
    metadata_schema: {
      fields: [
        { name: 'Current Step', type: 'select', required: false, options: ['Report Pull', 'Data Analysis', 'Slide Building', 'Review', 'Final Polish'] },
        { name: 'Client/Market', type: 'text', required: false },
        { name: 'Notes', type: 'textarea', required: false },
      ],
    },
  },
  {
    name: 'Prep for Client Convo - Generic',
    description: 'Capture your prep process and time for client conversations',
    is_official: true,
    metadata_schema: {
      fields: [
        { name: 'Client Name', type: 'text', required: true },
        { name: 'Prep Steps Completed', type: 'textarea', required: false },
        { name: 'Key Topics to Cover', type: 'textarea', required: false },
        { name: 'Notes', type: 'textarea', required: false },
      ],
    },
  },
  {
    name: 'Prep for Pitch',
    description: 'Track pitch preparation time and process',
    is_official: true,
    metadata_schema: {
      fields: [
        { name: 'Pitch/Opportunity Name', type: 'text', required: true },
        { name: 'Prep Steps Completed', type: 'textarea', required: false },
        { name: 'Key Differentiators', type: 'textarea', required: false },
        { name: 'Notes', type: 'textarea', required: false },
      ],
    },
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    // Get the admin user to set as creator
    const userResult = await client.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (userResult.rows.length === 0) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const adminId = userResult.rows[0].id;
    console.log(`Using admin user: ${adminId}`);

    // Clean up old processes
    console.log('\nCleaning up old processes...');
    for (const oldName of oldProcessNames) {
      const result = await client.query(
        'DELETE FROM processes WHERE name = $1 AND is_official = true RETURNING id',
        [oldName]
      );
      if (result.rowCount > 0) {
        console.log(`Deleted: ${oldName}`);
      }
    }

    // Add new processes
    console.log('\nAdding new processes...');
    for (const process of exampleProcesses) {
      // Check if process already exists
      const existing = await client.query(
        'SELECT id FROM processes WHERE name = $1 AND is_official = true',
        [process.name]
      );

      if (existing.rows.length > 0) {
        console.log(`Skipping "${process.name}" - already exists`);
        continue;
      }

      await client.query(
        `INSERT INTO processes (name, description, is_official, created_by, metadata_schema)
         VALUES ($1, $2, $3, $4, $5)`,
        [process.name, process.description, process.is_official, adminId, JSON.stringify(process.metadata_schema)]
      );

      console.log(`Created: ${process.name}`);
    }

    console.log('\nSeeding complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
