package ModelLayer;

import java.util.*;

public class RandomForest {
    private final int nTrees;
    private final int maxDepth;
    private final int minSamplesSplit;
    private final int nFeatures;
    private final List<DecisionTree> trees;

    public RandomForest(int nTrees, int maxDepth, int minSamplesSplit, int nFeatures) {
        this.nTrees = nTrees;
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
        this.nFeatures = nFeatures;
        this.trees = new ArrayList<>();
    }

    // Fit the Random Forest
    public void fit(double[][] X, int[] y) {
        for (int i = 0; i < nTrees; i++) {
            Map<String, Object> bootstrappedData = bootstrap(X, y);
            double[][] bootstrappedX = (double[][]) bootstrappedData.get("X");
            int[] bootstrappedY = (int[]) bootstrappedData.get("y");

            DecisionTree tree = new DecisionTree(maxDepth, minSamplesSplit, nFeatures);
            tree.fit(bootstrappedX, bootstrappedY);
            trees.add(tree);
        }
    }

    // Predict using the Random Forest
    public int[] predict(double[][] X) {
        int nSamples = X.length;
        int[][] treePredictions = new int[nTrees][nSamples];

        // Collect predictions from each tree
        for (int i = 0; i < nTrees; i++) {
            int[] predictions = trees.get(i).predict(X);
            for (int j = 0; j < nSamples; j++) {
                treePredictions[i][j] = predictions[j];
            }
        }

        // Majority vote
        int[] finalPredictions = new int[nSamples];
        for (int j = 0; j < nSamples; j++) {
            Map<Integer, Integer> voteCount = new HashMap<>();
            for (int i = 0; i < nTrees; i++) {
                voteCount.put(treePredictions[i][j], voteCount.getOrDefault(treePredictions[i][j], 0) + 1);
            }
            finalPredictions[j] = voteCount.entrySet().stream()
                                           .max(Map.Entry.comparingByValue())
                                           .get()
                                           .getKey();
        }
        return finalPredictions;
    }

    // Bootstrapping function
    Map<String, Object> bootstrap(double[][] X, int[] y) {
        int nSamples = X.length;
        double[][] bootstrappedX = new double[nSamples][];
        int[] bootstrappedY = new int[nSamples];
        Random rand = new Random();

        for (int i = 0; i < nSamples; i++) {
            int randomIndex = rand.nextInt(nSamples);
            bootstrappedX[i] = X[randomIndex];
            bootstrappedY[i] = y[randomIndex];
        }

        Map<String, Object> bootstrappedData = new HashMap<>();
        bootstrappedData.put("X", bootstrappedX);
        bootstrappedData.put("y", bootstrappedY);
        return bootstrappedData;
    }
    
}
