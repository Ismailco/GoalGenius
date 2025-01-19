import { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Handle user creation/update
    if (url.pathname === '/api/users' && request.method === 'POST') {
      try {
        const body = await request.json();

        // Check if user exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!existingUser) {
          // Create new user
          const { success } = await env.DB.prepare(`
            INSERT INTO users (id, name, email, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            body.id,
            body.name,
            body.email,
            new Date().toISOString(),
            new Date().toISOString()
          ).run();

          if (!success) {
            throw new Error('Failed to create user');
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error creating user:', errorMessage);
        return new Response(
          JSON.stringify({ error: 'Failed to create user', details: errorMessage }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Handle goals creation
    if (url.pathname === '/api/goals' && request.method === 'POST') {
      try {
        const body = await request.json();
        const goal = {
          id: crypto.randomUUID(),
          userId,
          title: body.title,
          description: body.description || '',
          category: body.category,
          timeFrame: body.timeFrame,
          status: body.status || 'not-started',
          progress: body.progress || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { success } = await env.DB.prepare(`
          INSERT INTO goals (id, userId, title, description, category, timeFrame, status, progress, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          goal.id,
          goal.userId,
          goal.title,
          goal.description,
          goal.category,
          goal.timeFrame,
          goal.status,
          goal.progress,
          goal.createdAt,
          goal.updatedAt
        ).run();

        if (!success) {
          throw new Error('Failed to insert goal');
        }

        return new Response(JSON.stringify(goal), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error creating goal:', errorMessage);
        return new Response(
          JSON.stringify({ error: 'Failed to create goal', details: errorMessage }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Goals CRUD
    if (url.pathname.startsWith('/api/goals')) {
      const goalId = url.pathname.split('/').pop();
      if (goalId && goalId !== 'goals') {
        // Single goal operations
        try {
          if (request.method === 'GET') {
            const stmt = env.DB.prepare('SELECT * FROM goals WHERE id = ? AND userId = ?');
            const result = await stmt.bind(goalId, userId).first();
            if (!result) {
              return new Response(JSON.stringify({ error: 'Goal not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
              });
            }
            return new Response(JSON.stringify(result), {
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (request.method === 'PATCH') {
            const body = await request.json();
            const sets: string[] = [];
            const values: any[] = [];
            Object.entries(body).forEach(([key, value]) => {
              if (key !== 'id' && key !== 'userId') {
                sets.push(`${key} = ?`);
                values.push(value);
              }
            });

            const stmt = env.DB.prepare(`
              UPDATE goals
              SET ${sets.join(', ')}, updatedAt = CURRENT_TIMESTAMP
              WHERE id = ? AND userId = ?
            `);

            const result = await stmt.bind(...values, goalId, userId).run();
            if (result.success) {
              const updated = await env.DB.prepare('SELECT * FROM goals WHERE id = ?')
                .bind(goalId)
                .first();
              return new Response(JSON.stringify(updated), {
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }

          if (request.method === 'DELETE') {
            const stmt = env.DB.prepare('DELETE FROM goals WHERE id = ? AND userId = ?');
            const result = await stmt.bind(goalId, userId).run();
            return new Response(JSON.stringify({ success: result.success }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return new Response(
            JSON.stringify({
              error: 'Failed to process request',
              details: errorMessage
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      } else {
        // Collection operations
        try {
          if (request.method === 'GET') {
            const stmt = env.DB.prepare(
              'SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC'
            );
            const { results } = await stmt.bind(userId).all();
            return new Response(JSON.stringify(results), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return new Response(
            JSON.stringify({
              error: 'Failed to process request',
              details: errorMessage
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }

    // Handle milestones
    if (url.pathname === '/api/milestones') {
      try {
        // GET milestones
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM milestones WHERE userId = ? ORDER BY date ASC'
          ).bind(userId).all();

          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // CREATE milestone
        if (request.method === 'POST') {
          const body = await request.json();

          // Validate required fields
          if (!body.title || !body.date) {
            return new Response(
              JSON.stringify({ error: 'Title and date are required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }

          const milestone = {
            id: crypto.randomUUID(),
            userId,
            title: body.title,
            description: body.description || '',
            date: body.date,
            completed: body.completed || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const { success } = await env.DB.prepare(`
            INSERT INTO milestones (
              id, userId, title, description, date, completed, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            milestone.id,
            milestone.userId,
            milestone.title,
            milestone.description,
            milestone.date,
            milestone.completed ? 1 : 0,
            milestone.createdAt,
            milestone.updatedAt
          ).run();

          if (!success) {
            throw new Error('Failed to insert milestone');
          }

          return new Response(JSON.stringify(milestone), {
            headers: { 'Content-Type': 'application/json' },
            status: 201,
          });
        }

        // UPDATE milestone
        if (request.method === 'PATCH') {
          const milestoneId = url.pathname.split('/').pop();
          const body = await request.json();

          const updates = [];
          const values = [];

          if (body.title !== undefined) {
            updates.push('title = ?');
            values.push(body.title);
          }
          if (body.description !== undefined) {
            updates.push('description = ?');
            values.push(body.description);
          }
          if (body.date !== undefined) {
            updates.push('date = ?');
            values.push(body.date);
          }
          if (body.completed !== undefined) {
            updates.push('completed = ?');
            values.push(body.completed ? 1 : 0);
          }

          updates.push('updatedAt = ?');
          values.push(new Date().toISOString());

          // Add milestoneId and userId to values array
          values.push(milestoneId);
          values.push(userId);

          const { success } = await env.DB.prepare(`
            UPDATE milestones
            SET ${updates.join(', ')}
            WHERE id = ? AND userId = ?
          `).bind(...values).run();

          if (!success) {
            throw new Error('Failed to update milestone');
          }

          const updatedMilestone = await env.DB.prepare(
            'SELECT * FROM milestones WHERE id = ? AND userId = ?'
          ).bind(milestoneId, userId).first();

          return new Response(JSON.stringify(updatedMilestone), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // DELETE milestone
        if (request.method === 'DELETE') {
          const milestoneId = url.pathname.split('/').pop();

          const { success } = await env.DB.prepare(
            'DELETE FROM milestones WHERE id = ? AND userId = ?'
          ).bind(milestoneId, userId).run();

          return new Response(JSON.stringify({ success }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error processing milestone request:', errorMessage);
        return new Response(
          JSON.stringify({
            error: 'Failed to process milestone request',
            details: errorMessage
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
