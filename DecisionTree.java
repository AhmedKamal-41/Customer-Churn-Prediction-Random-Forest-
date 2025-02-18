package ModelLayer;

import java.util.*;
import java.util.stream.Collectors;

class DecisionTree {
    private Node root;
    private int maxDepth;
    private int minSamplesSplit;
    private int nFeatures;
    private Random random = new Random();

    public DecisionTree(int maxDepth, int minSamplesSplit, int nFeatures) {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
        this.nFeatures = nFeatures;
    }
    public void setRandom(Random random) {
        this.random = random;
    }
    //Trains the decision tree 
    void fit(double[][] X, int[] y) {
        int nFeaturesAvailable = X[0].length;
        nFeatures = Math.min(nFeatures, nFeaturesAvailable); 
        this.root = growTree(X, y, 0);
    }

    //Recursively grows the decision tree 
    Node growTree(double[][] X, int[] y, int depth) {
        int nSamples = X.length;
        int nLabels = Arrays.stream(y).distinct().toArray().length;

        if (depth >= maxDepth || nLabels == 1 || nSamples < minSamplesSplit) {
            return new Node(mostCommonLabel(y));
        }

        // Randomly select features
        Random rand = new Random();
        Set<Integer> featureIndices = new HashSet<>();
        while (featureIndices.size() < nFeatures) {
            featureIndices.add(rand.nextInt(X[0].length)); 
        }

        // Find the best split
        int bestFeature = -1;
        double bestThreshold = Double.NaN;
        double bestGain = -1;

        for (int feature : featureIndices) {
            double[] thresholds = Arrays.stream(X).mapToDouble(row -> row[feature]).distinct().toArray();
            for (double threshold : thresholds) {
                double gain = informationGain(X, y, feature, threshold);
                if (gain > bestGain) {
                    bestGain = gain;
                    bestFeature = feature;
                    bestThreshold = threshold;
                }
            }
        }

        if (bestGain == -1) {
            return new Node(mostCommonLabel(y));
        }

        // Split data
        List<Integer> leftIndices = new ArrayList<>();
        List<Integer> rightIndices = new ArrayList<>();
        for (int i = 0; i < X.length; i++) {
            if (X[i][bestFeature] <= bestThreshold) {
                leftIndices.add(i);
            } else {
                rightIndices.add(i);
            }
        }

        double[][] leftX = subsetRows(X, leftIndices);
        int[] leftY = subsetArray(y, leftIndices);
        double[][] rightX = subsetRows(X, rightIndices);
        int[] rightY = subsetArray(y, rightIndices);

        Node leftChild = growTree(leftX, leftY, depth + 1);
        Node rightChild = growTree(rightX, rightY, depth + 1);
        return new Node(bestFeature, bestThreshold, leftChild, rightChild);
    }

    //Calculates the information gain from splitting the data at a specified feature and threshold
    private double informationGain(double[][] X, int[] y, int feature, double threshold) {
        double parentEntropy = entropy(y);

        // Split data
        List<Integer> leftIndices = new ArrayList<>();
        List<Integer> rightIndices = new ArrayList<>();
        for (int i = 0; i < X.length; i++) {
            if (X[i][feature] <= threshold) {
                leftIndices.add(i);
            } else {
                rightIndices.add(i);
            }
        }

        if (leftIndices.isEmpty() || rightIndices.isEmpty()) {
            return 0.0;
        }

        int[] leftY = subsetArray(y, leftIndices);
        int[] rightY = subsetArray(y, rightIndices);
        double leftWeight = (double) leftY.length / y.length;
        double rightWeight = (double) rightY.length / y.length;

        // Weighted entropy
        double childEntropy = leftWeight * entropy(leftY) + rightWeight * entropy(rightY);
        return parentEntropy - childEntropy;
    }
    //helper function used by information gain
    //Calculates the entropy of an array of labels, which measures the impurity of an attribute
    private double entropy(int[] y) {
        Map<Integer, Long> labelCounts = Arrays.stream(y)
                .boxed()
                .collect(Collectors.groupingBy(label -> label, Collectors.counting()));

        double entropy = 0.0;
        for (long count : labelCounts.values()) {
            double p = (double) count / y.length;
            entropy -= p * Math.log(p + 1e-9);
        }
        return entropy;
    }
    //Helper function to determines the most common label 
    //used to make a prediction at a leaf node when further splitting
    private int mostCommonLabel(int[] y) {
        return Arrays.stream(y)
                .boxed()
                .collect(Collectors.groupingBy(label -> label, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(-1);
    }
    //Extracts subsets of rows from X based on specified indices.
    //used for splitting the dataset into left and right branches during tree growth.
    private double[][] subsetRows(double[][] X, List<Integer> indices) {
        double[][] subset = new double[indices.size()][];
        for (int i = 0; i < indices.size(); i++) {
            subset[i] = X[indices.get(i)];
        }
        return subset;
    }
    //Extracts subsets of an array based on specified indices, similar to subsetRows but for the label array y.
    private int[] subsetArray(int[] array, List<Integer> indices) {
        int[] subset = new int[indices.size()];
        for (int i = 0; i < indices.size(); i++) {
            subset[i] = array[indices.get(i)];
        }
        return subset;
    }
    //Predicts the labels for a given dataset X by applying the decision tree
    public int[] predict(double[][] X) {
        return Arrays.stream(X)
                .mapToInt(this::predictSingle)
                .toArray();
    }
    //redicts the label for a single instance x by traversing the decision tree from the root to the leaf node
    private int predictSingle(double[] x) {
        Node node = root;
        while (!node.isLeafNode()) {
            if (x[node.feature] <= node.threshold) {
                node = node.left;
            } else {
                node = node.right;
            }
        }
        return node.value;
    }

}

