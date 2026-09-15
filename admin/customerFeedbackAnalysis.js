// ===== CUSTOMER FEEDBACK ANALYSIS =====
// Sample feedback data. Later this will be replaced by real feedback
// records from your groupmate's Customer Feedback module.
const sampleFeedback = [
  { feedbackId: 1, rating: 5, comment: "Super sarap at fresh!", date: "2026-09-01" },
  { feedbackId: 2, rating: 4, comment: "Masarap pero medyo mahal.", date: "2026-09-01" },
  { feedbackId: 3, rating: 3, comment: "Okay lang, pwede na.", date: "2026-09-02" },
  { feedbackId: 4, rating: 2, comment: "Matagal ang serbisyo.", date: "2026-09-02" },
  { feedbackId: 5, rating: 5, comment: "Ang bilis ng order, ang sarap din!", date: "2026-09-03" },
  { feedbackId: 6, rating: 1, comment: "Mali yung natanggap kong order.", date: "2026-09-03" },
];

// STEP 1: TRAVERSAL + COUNTING/FREQUENCY ANALYSIS
// This function goes through every feedback record once, and:
// - counts how many times each star rating (1-5) appears
// - adds up all ratings to calculate the average later
function analyzeFeedback(feedbackList) {
  // "ratingCounts" is a simple counter box for each star rating.
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;

  // TRAVERSAL: go through every feedback record one by one.
  for (let i = 0; i < feedbackList.length; i++) {
    const feedback = feedbackList[i];

    // COUNTING: increase the counter box that matches this rating.
    ratingCounts[feedback.rating]++;

    // Add to the running total, used later for the average.
    totalRatingSum += feedback.rating;
  }

  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback > 0 ? (totalRatingSum / totalFeedback) : 0;

  // CLASSIFICATION: group feedback into Positive / Neutral / Negative
  // based on the simple rule: 4-5 = Positive, 3 = Neutral, 1-2 = Negative.
  const positiveCount = ratingCounts[4] + ratingCounts[5];
  const neutralCount = ratingCounts[3];
  const negativeCount = ratingCounts[1] + ratingCounts[2];

  return {
    totalFeedback,
    averageRating,
    ratingCounts,
    positiveCount,
    neutralCount,
    negativeCount,
  };
}

// ===== RENDER FUNCTION =====
function renderFeedbackAnalysis(stats) {
  const container = document.getElementById("feedbackAnalysisContainer");

  container.innerHTML = `
    <div>
      <h3>Total Feedback</h3>
      <p>${stats.totalFeedback}</p>
    </div>
    <div>
      <h3>Average Rating</h3>
      <p>${stats.averageRating.toFixed(2)} / 5</p>
    </div>
    <div>
      <h3>Rating Distribution</h3>
      <p>5 stars: ${stats.ratingCounts[5]}</p>
      <p>4 stars: ${stats.ratingCounts[4]}</p>
      <p>3 stars: ${stats.ratingCounts[3]}</p>
      <p>2 stars: ${stats.ratingCounts[2]}</p>
      <p>1 star: ${stats.ratingCounts[1]}</p>
    </div>
    <div>
      <h3>Feedback Classification</h3>
      <p>Positive (4-5): ${stats.positiveCount}</p>
      <p>Neutral (3): ${stats.neutralCount}</p>
      <p>Negative (1-2): ${stats.negativeCount}</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeedbackAnalysis(analyzeFeedback(sampleFeedback));
});