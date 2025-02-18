package ModelLayer;

class Node {
    int feature; 
    double threshold; 
    Node left; 
    Node right; 
    Integer value; 

    // Constructor for internal nodes
    public Node(int feature, double threshold, Node left, Node right) 
    {
        this.feature = feature;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.value = null;
    }

    // Constructor for leaf nodes
    public Node(int value) {
        this.value = value;
        this.feature = -1;
        this.threshold = Double.NaN;
        this.left = null;
        this.right = null;
    }

    public boolean isLeafNode() {
        return value != null;
    }
}
