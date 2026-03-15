import Image from 'next/image';
import { Plus } from 'lucide-react';

const Hero = () => {
  return (
    <section className="wrapper mb-10 pt-28 md:mb-16">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left side: Content */}
          <div className="library-hero-text">
            <h1 className="library-hero-title">Your Library</h1>
            <p className="library-hero-description">
              Convert your books into interactive AI conversations.
              <br />
              Listen, learn, and discuss your favorite reads.
            </p>
            <button className="library-cta-primary">
              <Plus className="size-5" />
              Add new book
            </button>
          </div>

          {/* Center: Illustration (Mobile) */}
          <div className="library-hero-illustration">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and globe illustration"
              width={280}
              height={280}
              className="object-contain"
            />
          </div>

          {/* Center: Illustration (Desktop) */}
          <div className="library-hero-illustration-desktop">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and globe illustration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          {/* Right side: Steps */}
          <div className="library-steps-card min-w-[240px]">
            <div className="space-y-6">
              <div className="library-step-item">
                <div className="library-step-number">1</div>
                <div>
                  <h3 className="library-step-title">Upload PDF</h3>
                  <p className="library-step-description">Add your book file</p>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">2</div>
                <div>
                  <h3 className="library-step-title">AI Processing</h3>
                  <p className="library-step-description">
                    We analyze the content
                  </p>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">3</div>
                <div>
                  <h3 className="library-step-title">Voice Chat</h3>
                  <p className="library-step-description">Discuss with AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
