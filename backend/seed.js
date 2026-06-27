const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Expense = require('./models/Expense');
const Payment = require('./models/Payment');
const ProjectProgress = require('./models/ProjectProgress');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Optional: Clear existing data (Be careful with this in production, but fine for local dummy data)
    await User.deleteMany({});
    await Project.deleteMany({});
    await Expense.deleteMany({});
    await Payment.deleteMany({});
    await ProjectProgress.deleteMany({});

    // 1. Create Users (Admin, Site Manager, Clients)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@dhatri.com',
      password: 'password123',
      role: 'admin',
    });

    const siteManager = await User.create({
      name: 'Site Manager John',
      email: 'manager@dhatri.com',
      password: 'password123',
      role: 'site_manager',
    });

    const client1 = await User.create({
      name: 'TechCorp Industries',
      email: 'contact@techcorp.com',
      password: 'password123',
      role: 'client',
      company: 'TechCorp Industries'
    });

    const client2 = await User.create({
      name: 'Global Logistics',
      email: 'contact@globallogistics.com',
      password: 'password123',
      role: 'client',
      company: 'Global Logistics'
    });

    const client3 = await User.create({
      name: 'Sunrise Estates',
      email: 'contact@sunrise.com',
      password: 'password123',
      role: 'client',
      company: 'Sunrise Estates'
    });

    console.log('Users Seeded');

    // 2. Create Projects (10-15 projects)
    const projectsData = [
      { name: 'Tech Park Tower A', clientName: 'TechCorp Industries', client: client1._id, status: 'on track', contractValue: 5000000, budget: 4000000, completionPercentage: 75, startDate: new Date('2025-01-10'), expectedCompletionDate: new Date('2026-06-15') },
      { name: 'Logistics Hub North', clientName: 'Global Logistics', client: client2._id, status: 'at risk', contractValue: 2500000, budget: 2000000, completionPercentage: 40, startDate: new Date('2025-03-01'), expectedCompletionDate: new Date('2025-11-30') },
      { name: 'Sunrise Villas Phase 1', clientName: 'Sunrise Estates', client: client3._id, status: 'delayed', contractValue: 1800000, budget: 1500000, completionPercentage: 20, startDate: new Date('2025-02-15'), expectedCompletionDate: new Date('2025-09-01') },
      { name: 'Tech Park Tower B', clientName: 'TechCorp Industries', client: client1._id, status: 'on track', contractValue: 6000000, budget: 4800000, completionPercentage: 10, startDate: new Date('2025-06-01'), expectedCompletionDate: new Date('2027-01-15') },
      { name: 'Global Warehouse East', clientName: 'Global Logistics', client: client2._id, status: 'on track', contractValue: 1200000, budget: 950000, completionPercentage: 90, startDate: new Date('2024-10-01'), expectedCompletionDate: new Date('2025-07-30') },
      { name: 'Sunrise Villas Phase 2', clientName: 'Sunrise Estates', client: client3._id, status: 'on track', contractValue: 2200000, budget: 1700000, completionPercentage: 0, startDate: new Date('2026-01-10'), expectedCompletionDate: new Date('2026-10-20') },
      { name: 'City Center Mall Renovation', clientName: 'TechCorp Industries', client: client1._id, status: 'at risk', contractValue: 3500000, budget: 3000000, completionPercentage: 55, startDate: new Date('2025-04-01'), expectedCompletionDate: new Date('2026-02-28') },
      { name: 'Riverside Apartments', clientName: 'Sunrise Estates', client: client3._id, status: 'delayed', contractValue: 4500000, budget: 3800000, completionPercentage: 35, startDate: new Date('2025-01-01'), expectedCompletionDate: new Date('2025-12-31') },
      { name: 'Global Logistics HQ', clientName: 'Global Logistics', client: client2._id, status: 'on track', contractValue: 8500000, budget: 7000000, completionPercentage: 80, startDate: new Date('2024-06-15'), expectedCompletionDate: new Date('2025-08-15') },
      { name: 'TechCorp R&D Facility', clientName: 'TechCorp Industries', client: client1._id, status: 'on track', contractValue: 4000000, budget: 3200000, completionPercentage: 65, startDate: new Date('2025-02-01'), expectedCompletionDate: new Date('2026-05-30') },
      { name: 'Sunrise Community Park', clientName: 'Sunrise Estates', client: client3._id, status: 'on track', contractValue: 500000, budget: 400000, completionPercentage: 95, startDate: new Date('2025-01-01'), expectedCompletionDate: new Date('2025-07-01') },
      { name: 'North Port Expansion', clientName: 'Global Logistics', client: client2._id, status: 'at risk', contractValue: 5500000, budget: 4800000, completionPercentage: 15, startDate: new Date('2025-05-15'), expectedCompletionDate: new Date('2026-11-30') },
    ];

    const projects = await Project.insertMany(projectsData);
    console.log('Projects Seeded');

    // 3. Create Expenses
    const categories = ['Labour', 'Materials', 'Machinery', 'Subcontractor', 'Miscellaneous'];
    const expensesData = [];
    
    projects.forEach(project => {
      // Create 3-5 expenses for each project
      const numExpenses = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numExpenses; i++) {
        expensesData.push({
          project: project._id,
          category: categories[Math.floor(Math.random() * categories.length)],
          amount: Math.floor(Math.random() * 50000) + 5000,
          date: new Date(project.startDate.getTime() + Math.random() * (new Date().getTime() - project.startDate.getTime())),
          vendor: `Vendor ${Math.floor(Math.random() * 100)}`,
          description: `Regular payment for ${categories[Math.floor(Math.random() * categories.length)]}`
        });
      }
    });

    await Expense.insertMany(expensesData);
    console.log('Expenses Seeded');

    // 4. Create Payments
    const paymentsData = [];
    projects.forEach(project => {
      // Calculate how much should be paid based on completion % (roughly)
      const targetPaid = project.contractValue * (project.completionPercentage / 100);
      let accumulatedPaid = 0;
      
      // Add a few completed payments
      while (accumulatedPaid < targetPaid) {
        const amount = Math.min(Math.floor(Math.random() * 500000) + 100000, targetPaid - accumulatedPaid);
        if (amount <= 0) break;
        
        paymentsData.push({
          project: project._id,
          client: project.client,
          amount: amount,
          paymentDate: new Date(project.startDate.getTime() + Math.random() * (new Date().getTime() - project.startDate.getTime())),
          status: 'completed',
          paymentMode: ['Bank Transfer', 'Cheque'][Math.floor(Math.random() * 2)],
          reference: `TXN${Math.floor(Math.random() * 1000000)}`
        });
        accumulatedPaid += amount;
      }

      // Add a pending or overdue payment for some projects
      if (Math.random() > 0.5) {
        paymentsData.push({
          project: project._id,
          client: project.client,
          amount: Math.floor(Math.random() * 200000) + 50000,
          paymentDate: new Date(),
          status: Math.random() > 0.5 ? 'pending' : 'overdue',
          paymentMode: 'Bank Transfer',
          reference: `TXN${Math.floor(Math.random() * 1000000)}`
        });
      }
    });

    await Payment.insertMany(paymentsData);
    console.log('Payments Seeded');

    // 5. Create Milestones / Progress
    const progressData = [];
    projects.forEach(project => {
      progressData.push({
        project: project._id,
        milestone: 'Site Clearance and Preparation',
        completionPercent: 100,
        status: 'completed',
        dueDate: new Date(project.startDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        note: 'Site cleared successfully.'
      });
      
      progressData.push({
        project: project._id,
        milestone: 'Foundation and Substructure',
        completionPercent: project.completionPercentage > 30 ? 100 : project.completionPercentage,
        status: project.completionPercentage > 30 ? 'completed' : (project.completionPercentage > 0 ? 'in progress' : 'pending'),
        dueDate: new Date(project.startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
        note: 'Foundation work ongoing.'
      });
    });

    await ProjectProgress.insertMany(progressData);
    console.log('Milestones Seeded');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
