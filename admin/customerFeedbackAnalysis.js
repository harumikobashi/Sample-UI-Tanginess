// ===== CUSTOMER FEEDBACK ANALYSIS =====
// Sample feedback data. Later this will be replaced by real feedback
// records from your groupmate's Customer Feedback module.
const branchFeedback = {
  general: [
    { feedbackId: 1, rating: 5, comment: "Super sarap at fresh!", date: "2026-09-01", branch: "General" },
    { feedbackId: 2, rating: 4, comment: "Masarap pero medyo mahal.", date: "2026-09-01", branch: "General" },
    { feedbackId: 3, rating: 3, comment: "Okay lang, pwede na.", date: "2026-09-02", branch: "General" },
    { feedbackId: 4, rating: 2, comment: "Matagal ang serbisyo.", date: "2026-09-02", branch: "General" },
    { feedbackId: 5, rating: 5, comment: "Ang bilis ng order, ang sarap din!", date: "2026-09-03", branch: "General" },
    { feedbackId: 6, rating: 1, comment: "Mali yung natanggap kong order.", date: "2026-09-03", branch: "General" },
  ],
  plaridel: [
    { feedbackId: 11, rating: 5, comment: "Fresh at masarap ang yogurt!", date: "2026-09-01", branch: "Plaridel" },
    { feedbackId: 12, rating: 4, comment: "Maganda ang service.", date: "2026-09-02", branch: "Plaridel" },
    { feedbackId: 13, rating: 3, comment: "Okay naman, medyo mainit ang lugar.", date: "2026-09-03", branch: "Plaridel" },
    { feedbackId: 14, rating: 5, comment: "Sobrang ganda ng service at lasa.", date: "2026-09-03", branch: "Plaridel" },
  ],
  malolos: [
    { feedbackId: 21, rating: 4, comment: "Mabilis ang order at masarap.", date: "2026-09-01", branch: "Malolos" },
    { feedbackId: 22, rating: 2, comment: "Medyo mahabang pila.", date: "2026-09-02", branch: "Malolos" },
    { feedbackId: 23, rating: 5, comment: "Maganda ang ambiance at quality.", date: "2026-09-02", branch: "Malolos" },
    { feedbackId: 24, rating: 3, comment: "Okay lang ang product.", date: "2026-09-03", branch: "Malolos" },
  ],
};

function getSelectedBranchFeedback() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";
  return branchFeedback[selectedBranch] || branchFeedback.general;
}

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
  const totalFeedback = stats.totalFeedback || 0;
  const ratingEntries = [5, 4, 3, 2, 1];

  const ratingRows = ratingEntries.map((rating) => {
    const count = stats.ratingCounts[rating] || 0;
    const width = totalFeedback ? (count / totalFeedback) * 100 : 0;
    let sentiment = "neutral";

    if (rating >= 4) sentiment = "positive";
    if (rating <= 2) sentiment = "negative";

    return `
      <div class="rating-row" data-sentiment="${sentiment}">
        <span class="rating-label">${rating}★</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill" style="width: ${width}%"></div>
        </div>
        <span class="rating-count">${count}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="analytics-shell">
      <div class="feedback-grid">
        <div class="feedback-pill positive">
          <strong>${stats.totalFeedback}</strong>
          <span>Total Feedback</span>
        </div>
        <div class="feedback-pill neutral">
          <strong>${stats.averageRating.toFixed(2)}</strong>
          <span>Average Rating</span>
        </div>
        <div class="feedback-pill positive">
          <strong>${stats.positiveCount}</strong>
          <span>Positive</span>
        </div>
        <div class="feedback-pill negative">
          <strong>${stats.negativeCount}</strong>
          <span>Negative</span>
        </div>
      </div>

      <div class="data-card">
        <h3>Rating Distribution</h3>
        <div class="rating-list">
          ${ratingRows}
        </div>
      </div>

      <div class="data-card">
        <h3>Feedback Classification</h3>
        <div class="feedback-grid">
          <div class="feedback-pill positive">
            <strong>${stats.positiveCount}</strong>
            <span>Positive (4-5)</span>
          </div>
          <div class="feedback-pill neutral">
            <strong>${stats.neutralCount}</strong>
            <span>Neutral (3)</span>
          </div>
          <div class="feedback-pill negative">
            <strong>${stats.negativeCount}</strong>
            <span>Negative (1-2)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");

  function renderBranchFeedback() {
    renderFeedbackAnalysis(analyzeFeedback(getSelectedBranchFeedback()));
  }

  renderBranchFeedback();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchFeedback);
  }
});