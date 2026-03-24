namespace math {

template <typename T>
class Vector : public MagnitudeBase<T> {
public:
    float length() const;
};

float normalize(float value);
float undocumented(float value);

}
