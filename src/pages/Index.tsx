
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen pb-16">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-muted/50 to-background pt-16 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            ExamPrep<span className="text-primary">.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            The comprehensive exam preparation platform for students, teachers, and examiners.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">For Students</h3>
              <ul className="space-y-2">
                <li>• Practice with past exams</li>
                <li>• Track your progress</li>
                <li>• Get personalized feedback</li>
                <li>• Study efficiently with AI assistance</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">For Teachers</h3>
              <ul className="space-y-2">
                <li>• Create and manage exams</li>
                <li>• Automate grading processes</li>
                <li>• Track student performance</li>
                <li>• Generate detailed reports</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">For Examiners</h3>
              <ul className="space-y-2">
                <li>• Standardize evaluation criteria</li>
                <li>• Manage examination schedules</li>
                <li>• Access comprehensive analytics</li>
                <li>• Ensure exam integrity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to improve your exam results?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students, teachers, and institutions using our platform to achieve better outcomes.
          </p>
          {user ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/signup">Create Free Account</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
