namespace showcase {

template <typename T> class MagnitudeBase {
};

template <typename T> class Vector : public MagnitudeBase<T> {
public:
    explicit Vector(float value) : value_(value) {}

    float length() const {
        return value_ < 0.0f ? -value_ : value_;
    }

private:
    float value_;
};

inline float normalize(float value) {
    return value < 0.0f ? -value : value;
}

inline float demoCall() {
    Vector<int> vector(-2.0f);
    return normalize(vector.length());
}

}  // namespace showcase
