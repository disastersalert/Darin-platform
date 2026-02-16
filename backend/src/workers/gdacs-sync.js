import cron from 'node-cron';
import { fetchGDACSEvents } from '../services/gdacs.js';
import { upsertEvent } from '../services/events.js';
import { query } from '../config/database.js';

let syncRunning = false;

/**
 * Sync GDACS events to database
 */
export async function syncGDACSData() {
  if (syncRunning) {
    console.log('Sync already running, skipping...');
    return { skipped: true };
  }

  syncRunning = true;
  const syncStarted = new Date();
  
  try {
    // Log sync start
    const logResult = await query(
      'INSERT INTO sync_logs (sync_started_at, status) VALUES ($1, $2) RETURNING id',
      [syncStarted, 'running']
    );
    const syncLogId = logResult.rows[0].id;

    console.log('Starting GDACS sync...');
    
    // Fetch events from GDACS
    const events = await fetchGDACSEvents();
    console.log(`Fetched ${events.length} events from GDACS`);
    
    let created = 0;
    let updated = 0;
    
    // Upsert each event
    for (const event of events) {
      try {
        const existing = await query(
          'SELECT id FROM events WHERE id = $1',
          [event.id]
        );
        
        await upsertEvent(event);
        
        if (existing.rows.length > 0) {
          updated++;
        } else {
          created++;
        }
      } catch (err) {
        console.error(`Error upserting event ${event.id}:`, err.message);
      }
    }
    
    // Update sync log
    await query(
      `UPDATE sync_logs 
       SET sync_completed_at = $1, 
           events_fetched = $2, 
           events_created = $3, 
           events_updated = $4,
           status = $5
       WHERE id = $6`,
      [new Date(), events.length, created, updated, 'completed', syncLogId]
    );
    
    console.log(`Sync completed: ${created} created, ${updated} updated`);
    
    return {
      success: true,
      fetched: events.length,
      created,
      updated
    };
    
  } catch (error) {
    console.error('Sync error:', error.message);
    
    // Log error
    await query(
      `UPDATE sync_logs 
       SET sync_completed_at = $1, status = $2, error_message = $3
       WHERE sync_started_at = $4 AND status = 'running'`,
      [new Date(), 'failed', error.message, syncStarted]
    );
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    syncRunning = false;
  }
}

/**
 * Start cron worker for automatic syncing
 * Runs every 5 minutes
 */
export function startSyncWorker() {
  // Run immediately on startup
  setTimeout(() => {
    syncGDACSData();
  }, 5000);
  
  // Then every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Running scheduled GDACS sync...');
    syncGDACSData();
  });
  
  console.log('GDACS sync worker scheduled (every 5 minutes)');
}

export default {
  syncGDACSData,
  startSyncWorker
};
