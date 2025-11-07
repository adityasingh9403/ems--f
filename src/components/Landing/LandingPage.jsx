import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Camera, CheckSquare, DollarSign, ArrowRight, 
    Star, LifeBuoy, Award, Users, UserPlus 
} from 'lucide-react';
import LandingNavbar from '../Layout/LandingNavbar';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

// --- Naya Feature Card Component (Updated Look) ---
const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full">
        <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

// --- Naya "How it Works" Step Card ---
const StepCard = ({ icon: Icon, title, description, step }) => (
    <div className="flex flex-col items-center text-center fade-in-section">
        <div className="flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full text-white font-bold text-2xl shadow-md">
            {step}
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

// --- Naya Testimonial Card ---
const TestimonialCard = () => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto text-center fade-in-section">
        <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
            ))}
        </div>
        <blockquote className="text-xl italic font-medium text-slate-700 dark:text-slate-200">
            "EMS Portal ne hamare HR process ko hafto se dino mein la diya hai. Smart attendance feature ek game-changer hai."
        </blockquote>
        <p className="mt-4 font-semibold text-slate-800 dark:text-slate-100">Jane Doe</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">HR Manager, TechCorp</p>
    </div>
);


const LandingPage = () => {
    const navigate = useNavigate();

    // --- Animation Logic (waisa hi rahega) ---
    const [observer, setElements, entries] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '0px',
    });

    useEffect(() => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, [entries, observer]);

    useEffect(() => {
        const sections = document.querySelectorAll('.fade-in-section');
        setElements(sections);
    }, [setElements]);
    // --- End Animation Logic ---

    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200">
            <LandingNavbar />

            {/* 1. Hero Section */}
            <section className="pt-32 pb-24 max-w-6xl mx-auto px-4 text-center fade-in-section">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white">
                    The All-in-One <span className="text-teal-500">Employee Management</span> Portal
                </h1>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Manage attendance, tasks, payroll, and leave requests all in one place. Stop switching tabs, start managing.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 flex items-center gap-2"
                    >
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                        Login
                    </button>
                </div>

                {/* --- NAYA: Glowing Image --- */}
                <div className="mt-20 relative fade-in-section">
                    {/* Yeh div image ke peeche glow add karega */}
                    <div className="absolute inset-0 max-w-4xl mx-auto bg-gradient-to-br from-teal-500/20 to-cyan-500/20 blur-3xl -z-0"></div>
                    <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                        <img 
                            src="https://i.imgur.com/v82Hrgj.png" 
                            alt="EMS Dashboard Preview" 
                            className="rounded-lg"
                        />
                    </div>
                </div>
            </section>
            
            {/* --- NAYA: Social Proof Section --- */}
            <section className="py-16 fade-in-section">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Trusted by over 100+ companies worldwide
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">TechCorp</span>
                        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">InnovateCo</span>
                        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">Quantum Ltd.</span>
                        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">Alpha Solutions</span>
                        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">NextGen</span>
                    </div>
                </div>
            </section>

            {/* --- NAYA: "How it Works" Section --- */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16 fade-in-section">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Get started in 3 simple steps</h2>
                        <p className="mt-3 text-slate-500 dark:text-slate-400">Onboard your entire company in minutes.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <StepCard
                            step="1"
                            title="Create Your Company"
                            description="Sign up for a new admin account. It's free for 30 days."
                        />
                        <StepCard
                            step="2"
                            title="Add Employees"
                            description="Manually add your team members or use our bulk CSV import feature."
                        />
                        <StepCard
                            step="3"
                            title="Start Managing"
                            description="Track attendance, assign tasks, and manage payroll. It's that simple."
                        />
                    </div>
                </div>
            </section>

            {/* 2. Features Section (Updated) */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12 fade-in-section">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">One tool to replace them all</h2>
                        <p className="mt-3 text-slate-500 dark:text-slate-400">All the features you need, none of the bloat.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="fade-in-section" style={{ transitionDelay: '100ms' }}>
                            <FeatureCard
                                icon={Camera}
                                title="Smart Attendance"
                                description="Track clock-ins with facial recognition and live location data."
                            />
                        </div>
                        <div className="fade-in-section" style={{ transitionDelay: '200ms' }}>
                            <FeatureCard
                                icon={CheckSquare}
                                title="Visual Task Management"
                                description="Assign tasks and track progress with an easy-to-use Kanban board."
                            />
                        </div>
                        <div className="fade-in-section" style={{ transitionDelay: '300ms' }}>
                            <FeatureCard
                                icon={DollarSign}
                                title="Leave & Payroll"
                                description="Simplify leave requests with an approval flow and manage salary structures."
                            />
                        </div>
                        <div className="fade-in-section" style={{ transitionDelay: '400ms' }}>
                            <FeatureCard
                                icon={Users}
                                title="Organization Chart"
                                description="Automatically visualize your company's structure and reporting lines."
                            />
                        </div>
                        <div className="fade-in-section" style={{ transitionDelay: '500ms' }}>
                            <FeatureCard
                                icon={Award}
                                title="Performance Tracking"
                                description="Set goals, conduct reviews, and see employee performance rankings."
                            />
                        </div>
                        <div className="fade-in-section" style={{ transitionDelay: '600ms' }}>
                            <FeatureCard
                                icon={LifeBuoy}
                                title="Helpdesk System"
                                description="Manage all internal employee support tickets from one central location."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- NAYA: Testimonial Section --- */}
            <section className="py-24 bg-white dark:bg-slate-800">
                <TestimonialCard />
            </section>

            {/* 3. Final CTA Section */}
            <section className="py-24 text-center fade-in-section">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Start your 1-Month Free Trial</h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">No credit card required. Register your company in 60 seconds.</p>
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition-transform hover:scale-105"
                    >
                        Sign Up Now
                    </button>
                </div>
            </section>

            {/* 4. Footer */}
            <footer className="py-8 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} EMS Portal. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;