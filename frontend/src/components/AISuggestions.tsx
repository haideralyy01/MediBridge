import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

interface Suggestion {
  title: string;
  description: string;
  category: string;
}

interface AISuggestionsProps {
  patientData: {
    diagnoses?: string[];
    medicines?: string[];
    symptoms?: string[];
    age?: number;
    conditions?: string[];
  };
}

const AISuggestions = ({ patientData }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<{
    dos: Suggestion[];
    donts: Suggestion[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientData }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to default suggestions
      setSuggestions({
        dos: [
          { title: "Stay Hydrated", description: "8-10 glasses daily", category: "Health" },
          { title: "Exercise", description: "30 min moderate activity", category: "Fitness" },
          { title: "Balanced Diet", description: "Fruits and vegetables", category: "Nutrition" }
        ],
        donts: [
          { title: "Avoid Stress", description: "Practice relaxation", category: "Mental" },
          { title: "Limit Junk Food", description: "Reduce processed foods", category: "Diet" },
          { title: "Don't Skip Sleep", description: "7-8 hours nightly", category: "Rest" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [patientData]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Health Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-muted-foreground">Generating personalized suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Health Suggestions
        </h2>
        <Button
          onClick={fetchSuggestions}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* DO's Section */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Things to DO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.dos.map((suggestion, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">{suggestion.title}</h4>
                    <p className="text-sm text-green-700 mt-1">{suggestion.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {suggestion.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* DON'T's Section */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              Things to AVOID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.donts.map((suggestion, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">{suggestion.title}</h4>
                    <p className="text-sm text-red-700 mt-1">{suggestion.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {suggestion.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AISuggestions;