(module

    (global $key (import "state" "key") (mut i64))
    (global $ctr (import "state" "ctr") (mut i64))

    (func (export "key")
        (result i64)
        global.get $key
    )

    (func (export "ctr")
        (result i64)
        global.get $ctr
    )

    (func (export "setKey")
        (param $v i64)

        (global.set $key (local.get $v))
    )

    (func (export "setCtr")
        (param $v i64)

        (global.set $ctr (local.get $v))
    )

    (func $rand
        (result i32)

        ;; uint64_t x, y, z;
        (local $x i64)
        (local $y i64)
        (local $z i64)

        ;; y = x = ctr * key;
        (local.tee $y
            (local.tee $x
                (i64.mul
                    (global.get $ctr)
                    (global.get $key)
                )
            )
        )

        ;; z = y + key;
        (local.set $z
            (i64.add
                ;; $y
                (global.get $key)
            )
        )

        ;; Stateful; Increment $ctr
        (global.set $ctr
            (i64.add
                (global.get $ctr)
                (i64.const 1)
            )
        )

        ;; x = x*x + y; x = (x>>32) | (x<<32);       /* round 1 */
        (local.tee $x
            (i64.add
                (i64.mul
                    (local.get $x)
                    (local.get $x)
                )
                (local.get $y)
            )
        )

        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; x = x*x + z; x = (x>>32) | (x<<32);       /* round 2 */
        (local.tee $x
            (i64.add
                (i64.mul
                    ;; $x
                    (local.get $x)
                )
                (local.get $z)
            )
        )

        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; x = x*x + y; x = (x>>32) | (x<<32);       /* round 3 */
        (local.tee $x
            (i64.add
                (i64.mul
                    ;; $x
                    (local.get $x)
                )
                (local.get $y)
            )
        )
        (local.tee $x
            (i64.or
                (i64.shr_u
                    ;; $x
                    (i64.const 32)
                )
                (i64.shl
                    (local.get $x)
                    (i64.const 32)
                )
            )
        )

        ;; return (x*x + z) >> 32;                   /* round 4 */
        (i32.wrap_i64
            (i64.shr_u
                (i64.add
                    (i64.mul
                        ;; $x
                        (local.get $x)
                    )
                    (local.get $z)
                )
                (i64.const 32)
            )
        )
    )
    (export "rand" (func $rand))

    (func (export "randF")
        (result f64)

        (f64.div
            (f64.convert_i32_u
                (call $rand)
            )
            ;; Max i32_u
            (f64.const 0xffffffff)
        )
    )

    (func (export "randBound")
        (param $min i32)
        (param $max i32)
        (result i32)

        (local $delta i32)

        (local.set $delta
            (i32.sub
                ;; Add 1 to be max inclusive
                (i32.add
                    (local.get $max)
                    (i32.const 1)
                )
                (local.get $min)
            )
        )

        (i32.add
            (i32.rem_u
                (call $rand)
                (local.get $delta)
            )
            (local.get $min)
        )
    )

    (func (export "randBoundLemire")
        (param $min i32)
        (param $max i32)
        (result i32)

        (local $x i32)
        (local $m i64)
        (local $l i32)
        (local $range i64)
        (local $t i32)

        (local.set $range
            (i64.extend_i32_u
                (i32.sub
                    (i32.add
                        ;; Add 1 to make max inclusive
                        (local.get $max)
                        (i32.const 1)
                    )
                    (local.get $min)
                )
            )
        )

        ;; uint32_t t = (-range) % range;
        (local.set $t
            (i32.wrap_i64
                (i64.rem_u
                    ;; Get two's compliment
                    (i64.sub
                        ;; 2**32
                        (i64.const 100000000)
                        (local.get $range)
                    )
                    (local.get $range)
                )
            )
        )

        ;; do {
        (loop $attempt
            ;;    uint32_t x = rng();
            (local.tee $x (call $rand))

            ;;    uint64_t m = uint64_t(x) * uint64_t(range);
            ;;    uint32_t l = uint32_t(m);
            (local.tee $l
                (i32.wrap_i64
                    (local.tee $m
                        (i64.mul
                            (i64.extend_i32_u) ;; $x
                            (local.get $range)
                        )
                    )
                )
            )

            ;; while(l < t)
            (br_if $attempt
                (i32.lt_u
                    ;; $l
                    (local.get $t)
                )
            )
        )

        ;; return m >> 32;
        (i32.add
            (i32.wrap_i64
                (i64.shr_u
                    (local.get $m)
                    (i64.const 32)
                )
            )
            (local.get $min)
        )
    )
)